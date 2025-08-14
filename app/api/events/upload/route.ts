// import { put } from "@vercel/blob";

// export async function POST(request: Request) {
//  console.log("POST request", request);
//  const form = await request.formData();
//  const fileName = form.get("fileName") as string;
//  const file = form.get("file") as File;
//  const blob = await put(fileName, file, {
//   access: "public",
//   addRandomSuffix: true,
//   token: process.env.BLOB_READ_WRITE_TOKEN,
//  });

//  return Response.json(blob);
// }
