const Config = require('config');

const axios = require('axios');
const kakaoInstance = axios.create({
  baseURL: 'https://api.kakaowork.com',
  headers: {
	  //테스트 권한
	  Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
    // Authorization: `Bearer ${Config.keys.kakaoWork.testYoungMo}`,
	//Authorization: `Bearer ${Config.keys.kakaoWork.test_fumy}`,
	 // Authorization: `Bearer ${Config.keys.kakaoWork.testYeongKyu}`,
   // Authorization: `Bearer ${Config.keys.kakaoWork.testjh}`,
  },
});

exports.getUserList = async () => {
  const res = await kakaoInstance.get('/v1/users.list');
  return res.data.users;
};

exports.openConversations = async ({ userId }) => {
  const data = {
    user_id: userId,
  };
  const res = await kakaoInstance.post('/v1/conversations.open', data);
  return res.data.conversation;
};

exports.sendMessage = async ({ conversationId, text, blocks }) => {
  const data = {
    conversation_id: conversationId,
    text,
    ...blocks && { blocks },
  };
  const res = await kakaoInstance.post('/v1/messages.send', data);
  return res.data.message;
};
	
	
// function for db query - 이승범
// create table push_role(id int(100) not null AUTO_INCREMENT PRIMARY KEY,user_id int(100) not null,conversation_id int(100) not null,role varchar(100) not null);

const mysql = require("mysql2/promise");
const db_info = {
    host: "127.0.0.1",
    port: "3306",
    user: '28team',
    password: '111111',
    database: "chatbot",
};

exports.mysql_query = async (my_query) => {
    const conn = await mysql.createConnection(db_info);
    const [rows] = await conn.query(my_query);
    await conn.end();
    return rows;
};
	