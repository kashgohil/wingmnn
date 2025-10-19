import { Hono } from 'hono';
import { storageClient } from './client';

const storage = new Hono();

storage.get('/buckets', async (c) => {
  try {
    const buckets = await storageClient.listBuckets();
    return c.json(buckets);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

storage.post('/buckets', async (c) => {
  const { name } = await c.req.json();
  try {
    await storageClient.createBucket(name);
    return c.json({ message: 'Bucket created' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

storage.post('/upload', async (c) => {
  const formData = await c.req.formData();
  const bucket = (formData.get('bucket') as string) || 'uploads';
  const file = formData.get('file') as File;
  if (!file) return c.json({ error: 'File required' }, 400);

  try {
    // Ensure bucket exists
    await storageClient.createBucket(bucket);
  } catch (e) {
    // Bucket might already exist
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = `${Date.now()}-${file.name}`; // unique name
  await storageClient.uploadBuffer(bucket, objectName, buffer, file.size);

  const url = `${process.env.MINIO_ENDPOINT || 'http://localhost'}:${process.env.MINIO_PORT || '9000'}/${bucket}/${objectName}`;
  return c.json({ url });
});

storage.get('/objects/:bucket', async (c) => {
  const bucket = c.req.param('bucket');
  try {
    const objects = await storageClient.listObjects(bucket);
    return c.json(objects);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

storage.delete('/objects/:bucket/:object', async (c) => {
  const bucket = c.req.param('bucket');
  const object = c.req.param('object');
  try {
    await storageClient.deleteObject(bucket, object);
    return c.json({ message: 'Object deleted' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export { storage };