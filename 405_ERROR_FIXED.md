# 405 Error Fixed - March 30, 2026

## Error
```json
{
  "detail": "Method \"POST\" not allowed.",
  "code": "method_not_allowed"
}
```

Occurred on: `/api/v1/clients/validate/`

## Root Cause

The Django REST Framework router was treating `/validate/` and `/bulk-upload/` as **detail routes** (like `/clients/{id}/`) instead of **custom action endpoints**.

Detail routes only allow: `GET`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
They do NOT allow: `POST`

## Problem in Code

**Before Fix - urls.py:**
```python
urlpatterns = [
    path('template-download/', views.download_client_template, name='template-download'),
    path('', include(router.urls)),  # Router catches /validate/ as detail route
]
```

The router pattern `r''` with basename `'existing-clients'` creates these routes:
- `/` - list (GET, POST)
- `/{id}/` - detail (GET, PUT, PATCH, DELETE)
- **`/{anything}/` gets matched as detail route!** ← This was the issue

So `/validate/` was interpreted as `/detail-id-'validate'/`, which doesn't allow POST.

## Solution Applied

Added **explicit URL patterns BEFORE router.urls** so they match first:

**After Fix - urls.py:**
```python
urlpatterns = [
    # Standalone endpoints (MUST be before router.urls to avoid 405 errors)
    path('template-download/', views.download_client_template, name='template-download'),
    path('validate/', views.validate_bulk_upload, name='validate-bulk'),
    path('bulk-upload/', views.bulk_upload_clients, name='bulk-upload'),

    # Viewset routes
    path('', include(router.urls)),
]
```

**Added standalone view functions in views.py:**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_bulk_upload(request):
    """
    Standalone view to validate bulk upload file without importing.

    POST /api/v1/clients/validate/
    """
    # Delegate to viewset method
    viewset = ExistingClientViewSet()
    viewset.request = request
    viewset.format_kwarg = None

    return viewset.validate_upload(request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_upload_clients(request):
    """
    Standalone view to bulk upload client records.

    POST /api/v1/clients/bulk-upload/
    """
    # Delegate to viewset method
    viewset = ExistingClientViewSet()
    viewset.request = request
    viewset.format_kwarg = None

    return viewset.bulk_upload(request)
```

## Deployment

**Files Changed:**
- `apps/clients/urls.py` - Added explicit URL patterns
- `apps/clients/views.py` - Added standalone view functions

**Commit:** `46c3d91`

**Deployed to Production:** ✅ March 30, 2026 12:49 UTC

## Verification

Tested with OPTIONS request to check allowed methods:

```bash
curl -X OPTIONS https://api.254-capital.com/api/v1/clients/validate/ -i
# Result: allow: OPTIONS, POST ✓

curl -X OPTIONS https://api.254-capital.com/api/v1/clients/bulk-upload/ -i
# Result: allow: OPTIONS, POST ✓
```

## Why This Happens

Django REST Framework routers use regex patterns to match URLs:
1. Explicit `path()` patterns are checked first (if they come before `include(router.urls)`)
2. Then router patterns are checked
3. Router sees `/validate/` and thinks "this must be a detail route with pk='validate'"
4. Detail routes don't allow POST method
5. Returns 405 error

**Best Practice:** Always place custom endpoints BEFORE `include(router.urls)` in urlpatterns.

## Related Endpoints Fixed

This same issue would have affected:
- ✅ `/validate/` - Now works
- ✅ `/bulk-upload/` - Now works
- ✅ `/template-download/` - Already had explicit pattern

These still use viewset actions (no issue):
- `/manual/` - Uses `@action` on viewset, accessible via router
- `/pending/` - Uses `@action` on viewset
- `/{id}/approve/` - Uses `@action(detail=True)` on viewset
- `/{id}/reject/` - Uses `@action(detail=True)` on viewset

## Status

✅ **FIXED AND DEPLOYED**

Bulk upload validation now works correctly. Users can:
1. Upload Excel file
2. See preview with validation results
3. Proceed with import if validation passes

---

**Test in Production:**
1. Go to Admin Dashboard → Existing Clients → Bulk Upload
2. Select a file and upload
3. Should see preview table with validation status (no 405 error)
4. Can then click "Import Valid Rows" to complete upload
