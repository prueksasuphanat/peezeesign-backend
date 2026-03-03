# การปรับปรุง getAllConstituencies API

## สรุปการเปลี่ยนแปลง

ปรับปรุง API `GET /api/election/constituencies` ให้แสดงข้อมูลเพิ่มเติมใน `_count`:

- `candidates` - จำนวนผู้สมัคร (เดิม)
- `eligibleVoters` - จำนวนผู้มีสิทธิเลือกตั้ง (ใหม่)
- `parties` - จำนวนพรรคที่มีผู้สมัครในเขตนั้น (ใหม่)

## ตัวอย่าง Response

### ก่อนแก้ไข

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "province": "กรุงเทพมหานคร",
      "districtNumber": 1,
      "isClosed": false,
      "_count": {
        "candidates": 2
      }
    }
  ]
}
```

### หลังแก้ไข

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "province": "กรุงเทพมหานคร",
      "districtNumber": 1,
      "isClosed": false,
      "_count": {
        "candidates": 2,
        "eligibleVoters": 150,
        "parties": 2
      }
    }
  ]
}
```

## ไฟล์ที่แก้ไข

### 1. `src/repositories/constituency.repository.ts`

เพิ่ม 2 functions ใหม่:

#### `findAllWithExtendedCounts()`

- Query constituencies ทั้งหมดพร้อมข้อมูลเพิ่มเติม
- นับจำนวน candidates และ users (ผู้มีสิทธิเลือกตั้ง)
- ดึง distinct partyId จาก candidates เพื่อนับจำนวนพรรค

#### `findByProvinceWithExtendedCounts(province: string)`

- Query constituencies ตามจังหวัดพร้อมข้อมูลเพิ่มเติม
- มีโครงสร้างเหมือน `findAllWithExtendedCounts()` แต่กรองตามจังหวัด

### 2. `src/services/election.service.ts`

แก้ไข `getConstituencies()`:

- ใช้ `findAllWithExtendedCounts()` หรือ `findByProvinceWithExtendedCounts()` แทน
- Transform ข้อมูลเพื่อเพิ่ม `eligibleVoters` และ `parties` ใน `_count`
- `eligibleVoters` มาจาก `_count.users`
- `parties` มาจากจำนวน distinct partyId (candidates.length)

## การทำงาน

1. Repository query ข้อมูลจาก database:
   - `_count.candidates` - จำนวนผู้สมัครทั้งหมด
   - `_count.users` - จำนวนผู้มีสิทธิเลือกตั้งในเขตนั้น
   - `candidates` (distinct partyId) - รายการ partyId ที่ไม่ซ้ำกัน

2. Service transform ข้อมูล:
   - เก็บ `_count.candidates` ไว้
   - เปลี่ยน `_count.users` เป็น `_count.eligibleVoters`
   - นับจำนวน distinct partyId เป็น `_count.parties`

## การทดสอบ

### ทดสอบด้วย API

```bash
# Get all constituencies
curl http://localhost:3001/api/election/constituencies

# Get constituencies by province
curl http://localhost:3001/api/election/constituencies?province=กรุงเทพมหานคร
```

### ทดสอบด้วย Script

```bash
# แสดง response format
npm run tsx tests/test-constituencies-response.ts
```

## หมายเหตุ

- API endpoint ไม่เปลี่ยนแปลง
- Query parameters ไม่เปลี่ยนแปลง
- Backward compatible - ข้อมูลเดิมยังคงอยู่ แค่เพิ่มข้อมูลใหม่
- ไม่กระทบกับ API อื่น
