import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export class StorageClient {
  private client = minioClient;

  async listBuckets() {
    return this.client.listBuckets();
  }

  async createBucket(bucketName: string) {
    return this.client.makeBucket(bucketName, 'us-east-1');
  }

  async uploadFile(bucketName: string, objectName: string, filePath: string, metaData?: Record<string, string>) {
    return this.client.fPutObject(bucketName, objectName, filePath, metaData);
  }

  async uploadBuffer(bucketName: string, objectName: string, buffer: Buffer, size: number, metaData?: Record<string, string>) {
    return this.client.putObject(bucketName, objectName, buffer, size, metaData);
  }

  async downloadFile(bucketName: string, objectName: string, filePath: string) {
    return this.client.fGetObject(bucketName, objectName, filePath);
  }

  async listObjects(bucketName: string, prefix?: string) {
    const stream = this.client.listObjects(bucketName, prefix);
    const objects: any[] = [];
    for await (const obj of stream) {
      objects.push(obj);
    }
    return objects;
  }

  async deleteObject(bucketName: string, objectName: string) {
    return this.client.removeObject(bucketName, objectName);
  }

  async getObjectStats(bucketName: string, objectName: string) {
    return this.client.statObject(bucketName, objectName);
  }
}

export const storageClient = new StorageClient();