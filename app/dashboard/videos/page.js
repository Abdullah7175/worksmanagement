import { columns } from "./columns"
import { DataTable } from "./data-table"

async function getData() {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "Hassan",
      contact: 9342736178,
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      name: "John",
      contact: 9342736178,
      email: "abc@example.com",
    },
    {
      id: "728ed52f",
      name: "Alex",
      contact: 9342736178,
      email: "syz@example.com",
    },
  ]
}

export default async function Page() {
  const data = await getData()

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={data}>
        <h1 className="text-3xl font-semibold">Videos</h1>
      </DataTable>
    </div>
  )
}
