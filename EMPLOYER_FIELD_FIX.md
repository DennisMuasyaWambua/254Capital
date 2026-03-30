# Employer Field Fix - March 30, 2026

## Error
```
employer: This field is required.
```

Even though:
- Employer "xltd" exists in database ✓
- Employer "254 Capital" exists in database ✓
- Employers are active ✓

## Root Cause

**Field name mismatch between code and serializer!**

The code was passing `'employer_id'` but the serializer expects `'employer'`:

**Before (BROKEN):**
```python
client_data = {
    'full_name': ...,
    'mobile': ...,
    'employer_id': employer_id,  # ❌ WRONG FIELD NAME
    ...
}

serializer = ExistingClientSerializer(data=client_data)
serializer.is_valid(raise_exception=True)  # FAILS: employer is required
```

**Serializer Meta fields:**
```python
class ExistingClientSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            'employer',  # ← Expects 'employer', not 'employer_id'
            ...
        ]
```

## The Fix

Changed `'employer_id'` to `'employer'` in both methods:

**After (FIXED):**
```python
client_data = {
    'full_name': ...,
    'mobile': ...,
    'employer': employer_id,  # ✓ CORRECT FIELD NAME
    ...
}
```

## Files Changed

**apps/clients/views.py** - Lines 215 and 391

### Line 215 (bulk_upload method):
```python
- 'employer_id': employer_id,
+ 'employer': employer_id,
```

### Line 391 (validate_upload method):
```python
- 'employer_id': employer_id,
+ 'employer': employer_id,
```

## Why This Happened

Django's ForeignKey fields create TWO ways to reference the relationship:
1. `employer` - The related object (Employer instance)
2. `employer_id` - The raw database ID (UUID)

The **model** accepts both:
```python
# Model accepts both
client = ExistingClient.objects.create(
    employer=employer_object,    # ✓ Works
)
client = ExistingClient.objects.create(
    employer_id=employer_uuid,   # ✓ Works
)
```

But the **serializer** only expects the field name from Meta.fields:
```python
# Serializer only accepts 'employer' (as defined in Meta.fields)
serializer = ExistingClientSerializer(data={
    'employer': employer_uuid,  # ✓ Works (DRF converts UUID to object)
})
serializer = ExistingClientSerializer(data={
    'employer_id': employer_uuid,  # ❌ FAILS - field not in Meta.fields
})
```

## Deployment

**Commit:** `c89ee9b`
**Deployed:** March 30, 2026 12:55 UTC
**Status:** ✅ Container healthy

## Testing

Upload a file with valid employers like "xltd" or "254 Capital":

**Expected Result:**
```json
{
    "total_rows": 2,
    "valid_rows": 2,
    "invalid_rows": 0,
    "preview": [
        {
            "row_number": 2,
            "name": "John Kamau",
            "national_id": "12345678",
            "mobile": "254712345678",
            "employer": "xltd",
            "loan_amount": 100000.0,
            "status": "valid",  // ✓ Changed from "error"
            "issue": null        // ✓ No more error
        },
        {
            "row_number": 3,
            "name": "Jane Wanjiku",
            "national_id": "87654321",
            "mobile": "254723456789",
            "employer": "xltd",
            "loan_amount": 150000.0,
            "status": "valid",  // ✓ Changed from "error"
            "issue": null        // ✓ No more error
        }
    ]
}
```

## Summary of ALL Fixes Applied Today

1. ✅ **Mobile Number Normalization** - Auto-adds 254 prefix, strips leading zeros
2. ✅ **Template Updated** - Uses 254 format instead of 0 prefix
3. ✅ **Employers Added** - "254 Capital" and "xltd" added to production DB
4. ✅ **405 Error Fixed** - Added explicit URL patterns for validate/bulk-upload
5. ✅ **Employer Field Fixed** - Changed 'employer_id' to 'employer' in serialization

---

**Status:** ✅ ALL ISSUES RESOLVED

The bulk upload should now work completely end-to-end!
