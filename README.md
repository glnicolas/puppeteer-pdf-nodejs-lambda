# WIP - PDF generation using Puppeteer on AWS Lambda NodeJS 20.x

This is a PoC to demonstrate how to run puppeteer and chromium over AWS Lambda.

Dependencies: 
-
- Puppeteer-core
- Puppeteer-report
- Chromium  by Sparticuz
- Docker
- Amazon Linux 2023 instance (works with WSL2)

 
There are two posible ways to build the template:

- Using a Cloud9 instance with 20+ Gb disk space
- Running over WSL2, follow instruccions below to setup development environment [Amazon Linux 2023 on Windows with WSL 2
 by @thecloudranger](https://gist.github.com/thecloudranger/4d09bb7be40331b60238689f2423f1e1)

Steps to deploy the project:
- 
    $ git clone repo_url
    $ cd src/
    $ npm install
    $ cd ..
    $ sam build
    $ sam local invoke #to validate if everything is working
    $ sam deploy --guided

Note: Guide is incomplete, will be working on it