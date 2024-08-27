// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import path from 'node:path';
import ejs from 'ejs';
import report from 'puppeteer-report';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const chromiumModule = await import('@sparticuz/chromium');
const chromium = chromiumModule.default;

chromium.setHeadlessMode = 'shell';
chromium.setGraphicsMode = false;

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
    },
});

async function uploadPdfToS3(buffer, bucketName, fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: 'application/pdf',
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);
        console.log(`File uploaded successfully. ${fileName}`);
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error(`Error uploading file: ${error.message}`);
        throw error;
    }
}

async function sendReport(reportData) {
    console.log('executablepath ', await chromium.executablePath());

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        userDataDir: '/tmp/chromeData'
    });

    try {
        const page = await browser.newPage();
        await page.setContent(reportData, { waitUntil: 'domcontentloaded' });
        await page.emulateMediaType('screen');

        const pdf = await report.pdfPage(page, {
            format: "letter",
            margin: {
                bottom: "5mm",
                left: "5mm",
                right: "5mm",
                top: "5mm",
            },
        });

        const bufferpdf = Buffer.from(pdf, 'base64');

        const bucketName = 'testbucket-glcloud';
        const fileName = 'report.pdf';

        fs.writeFileSync('/tmp/report.pdf', bufferpdf);
        try {
            const fileUrl = await uploadPdfToS3(bufferpdf, bucketName, fileName);
            console.log('Successful:', fileUrl);
        } catch (error) {
            console.error('Error uploading file ', error);
        }
        return bufferpdf;
    } finally {
        await browser.close();
    }
}

async function getContractReport() {
    const templatePath = path.resolve('./templates/contract.ejs');
    console.log('template path ', templatePath);

    return new Promise((resolve, reject) => {
        ejs.renderFile(templatePath, {}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// getContractReport().then(async report => await sendReport(report))

export const handler = async (event) => {
    console.log('requestBody ', event?.body);

    try {
        const reportData = await getContractReport();
        const pdf = await sendReport(reportData);

        const response = {
            statusCode: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=contract_report.pdf"
            },
            body: pdf.toString("base64"),
            isBase64Encoded: true
        };

        return response;
    } catch (error) {
        console.error("Error generating PDF:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error generating PDF", error: error.message }),
        };
    }
};
