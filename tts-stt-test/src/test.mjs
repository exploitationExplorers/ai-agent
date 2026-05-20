const tencentcloud = require("tencentcloud-sdk-nodejs-vrs");

const VrsClient = tencentcloud.vrs.v20200824.Client;

// 密钥信息从环境变量读取，需要提前在环境变量中设置 TENCENTCLOUD_SECRET_ID 和 TENCENTCLOUD_SECRET_KEY
// 使用环境变量方式可以避免密钥硬编码在代码中，提高安全性
// 生产环境建议使用更安全的密钥管理方案，如密钥管理系统(KMS)、容器密钥注入等
// 请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: process.env.SECRET_ID,
    secretKey: process.env.SECRET_KEY,
  },
// 使用临时密钥示例
/*
  credential: {
    secretId: "SecretId",
    secretKey: "SecretKey",
    token: "Token",
  }
*/
  region: "",
  profile: {
    httpProfile: {
      endpoint: "vrs.tencentcloudapi.com",
    },
  },
};

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new VrsClient(clientConfig);
const params = {};
client.GetVRSVoiceTypes(params).then(
  (data) => {
    console.log(data);
  },
  (err) => {
    console.error("error", err);
  }
);