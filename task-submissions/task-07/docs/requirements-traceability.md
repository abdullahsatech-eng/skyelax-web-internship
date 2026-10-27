# Requirements traceability - Task 07

Status legend: **Implemented** = code exists. **Verified** = actually run with evidence in the testing record.
Nothing is marked Verified yet because no tests or builds could be executed in the authoring environment.

| ID | Official requirement | Implementation | Tests (file) | Status |
|---|---|---|---|---|
| R01 | Create the required database | Atlas database named by `MONGODB_DATABASE`; setup guide in README; `server/src/db/connection.ts`, `server/src/scripts/setup.ts` | `products.integration.test.ts` (health shows connected) | Implemented; not verified |
| R02 | Create tables/collections | `server/src/models/{Category,Supplier,Product}.ts`; indexes built by `connectDatabase` | `products.integration.test.ts` (duplicate SKU needs the unique index) | Implemented; not verified |
| R03 | Define relationships | `categoryId`/`supplierId` references; existence checks in `routes/products.ts` (`assertReferencesExist`) | `products.integration.test.ts` (nonexistent category/supplier) | Implemented; not verified |
| R04 | Connect backend to database | `db/connection.ts` (connect, ping, index init), `server.ts` (refuses to start if connection fails), `middleware/requireDatabase.ts` | `errorHandling.test.ts` (503 when disconnected); integration test | Implemented; not verified against Atlas |
| R05 | Insert data | `POST /api/products`; `ProductForm.tsx`, `App.tsx` | integration (create + re-read); `App.test.tsx` (mocked UI) | Implemented; not verified |
| R06 | Retrieve data | `GET /api/products`, `/:id`, categories, suppliers | integration; `App.test.tsx` | Implemented; not verified |
| R07 | Update data | `PUT /api/products/:id`; edit form | integration (update persists, `updatedAt` changes); `App.test.tsx` | Implemented; not verified |
| R08 | Delete data | `DELETE /api/products/:id`; `ConfirmDialog.tsx` | integration (204, then 404); `App.test.tsx` | Implemented; not verified |
| R09 | Input validation | `validation/product.ts` (server), `lib/validateProduct.ts` (client), model constraints | `validation.test.ts`, `validateProduct.test.ts`, integration invalid-data cases, `App.test.tsx` | Implemented; not verified |
| R10 | Display database data in the frontend | `api/stockdeskApi.ts` -> `App.tsx` -> `ProductTable.tsx` | `App.test.tsx` (mocked); manual browser check | Implemented; not verified |
| R11 | Handle database errors | `middleware/errorHandler.ts` (409/400/503/500 mapping, no leaks); UI error states | `errorHandling.test.ts`; `App.test.tsx` (load/save/delete failures) | Implemented; not verified |
| R12 | Test major database operations | server + client test suites, Postman collection, manual checklist | all of the above | Test code written; **not run** |
