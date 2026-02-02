import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string, folder: string = "games") {

    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const fileKey = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file,
        ContentType: contentType,
    });

    await s3Client.send(command);

    return fileKey;
}

export async function getPresignedUrl(key: string) {
    if (!key || key.startsWith('http')) return key;

    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
}

export async function deleteFileFromS3(key: string) {
    if (!key || key.startsWith('http')) return;

    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    await s3Client.send(command);
}

export async function getPresignedUploadUrl(fileName: string, contentType: string, folder: string = "games") {
    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const fileKey = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, key: fileKey };
}
