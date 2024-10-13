'use server';

import db from '@/db/db';
import { z } from 'zod';
import fs from 'fs/promises';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { S3 } from '@aws-sdk/client-s3';

const s3 = new S3({
  region: 'eu-north-1',
});

const fileSchema = z.instanceof(File, { message: 'Required' });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith('image/')
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  image: imageSchema.refine((file) => file.size > 0, 'Required'),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await s3.putObject({
    Bucket: 'badenbikeshop',
    Key: data.image.name,
    Body: Buffer.from(await data.image.arrayBuffer()),
    ContentType: data.image.type,
  });

  const imagePath = `https://badenbikeshop.s3.eu-north-1.amazonaws.com/${data.image.name}`;

  await db.product.create({
    data: {
      isAvailable: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
    },
  });

  revalidatePath('/');
  revalidatePath('/products');

  redirect('/admin/products');
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });

  if (product == null) {
    return notFound();
  }

  let imagePath = product.imagePath;

  if (data.image != null && data.image.size > 0) {
    await s3.deleteObject({
      Bucket: 'badenbikeshop',
      Key: product.imagePath.split('/').pop(),
    });

    await s3.putObject({
      Bucket: 'badenbikeshop',
      Key: data.image.name,
      Body: Buffer.from(await data.image.arrayBuffer()),
      ContentType: data.image.type,
    });

    imagePath = `https://badenbikeshop.s3.eu-north-1.amazonaws.com/${data.image.name}`;
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
    },
  });

  revalidatePath('/');
  revalidatePath('/products');

  redirect('/admin/products');
}

export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailable } });

  revalidatePath('/');
  revalidatePath('/products');
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });

  if (product == null) return notFound();

  await fs.unlink(`public${product.imagePath}`);

  revalidatePath('/');
  revalidatePath('/products');
}
