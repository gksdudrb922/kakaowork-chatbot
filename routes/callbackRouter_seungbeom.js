const express = require('express');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');
let roleSelectedMessage = require('../blockKit/pushMessage/roleSelectedMessage');
let chatBlock = require('../blockKit/pushMessage/chatBlock');
const welcomeMessage = require("../blockKit/WelcomeMessage");
const setRoleMessage = require("../blockKit/pushMessage/setRoleMessage");
let showRoleMessage = require("../blockKit/pushMessage/showRoleMessage");
let noRoleMessage = require("../blockKit/pushMessage/noRoleMessage");
const resetRoleMessage = require("../blockKit/pushMessage/resetRoleMessage");
const noExistRoleMessage = require("../blockKit/pushMessage/noExistRoleMessage");


// routes/callback.js
router.post('/', async (req, res, next) => {
  const { message, actions, action_time, value, react_user_id } = req.body; // 설문조사 결과 확인 (2)
  console.log("callback",value);
  console.log(actions);
  // console.log("select * from:", (await libKakaoWork.mysql_query('select * from push_role')));
  switch (value) {
	  case 'addRole':{
		  await libKakaoWork.mysql_query(`insert into push_role(user_id,conversation_id,role) values(${react_user_id},${message.conversation_id},"${actions.input_name}")`);
		  roleSelectedMessage.blocks[1].text=`선택하신 역할은 ${actions.input_name}입니다.`;
		  roleSelectedMessage.blocks[2].text=`앞으로 ${actions.input_name} 메세지를 수신합니다.`;
		  await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: roleSelectedMessage.text,
                blocks: roleSelectedMessage.blocks,
            });
		  res.json(roleSelectedMessage);
		  break;
	  }
	  case 'selectRole':{
		  await libKakaoWork.mysql_query(`insert into push_role(user_id,conversation_id,role) values(${react_user_id},${message.conversation_id},"${actions.select_name}")`);
		  roleSelectedMessage.blocks[1].text=`선택하신 역할은 ${actions.select_name}입니다.`;
		  roleSelectedMessage.blocks[2].text=`앞으로 ${actions.select_name} 메세지를 수신합니다.`;
		  await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: roleSelectedMessage.text,
                blocks: roleSelectedMessage.blocks,
            });
		  res.json(roleSelectedMessage);
		  break;
	  }
	  case 'sendSuccessMessage':{
		  console.log(actions.select_name);
		  let rows= await libKakaoWork.mysql_query(`select distinct conversation_id from push_role where role="${actions.select_name}";`);
		  console.log(rows);
		  chatBlock.blocks[0].text=`${actions.select_name}팀에게 온 메세지입니다.`
		  chatBlock.blocks[1].text=`${actions.input_name}`;
		  await Promise.all([
			  rows.map((row)=>{
				  return libKakaoWork.sendMessage({
					conversationId: row.conversation_id,
					text: "Push alarm message",
					blocks: chatBlock.blocks
				  });
			  })
		  ]);
		  res.json({});
		  break;
	  }
	  case "setRoleMessage": {
			console.log(value);
            libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: setRoleMessage.text,
                blocks: setRoleMessage.blocks,
            });
            res.json({});
            break;
        }
	  case "showRoleMessage": {
            let rows = await libKakaoWork.mysql_query(
                `select distinct role from push_role where user_id=${react_user_id};`
            );
            let role_message;
            if (rows.length !== 0) {
                const roles = rows.map((row) => {
                    return row.role;
                });
                const roles_str = roles.join(", ");
                showRoleMessage.blocks[0].text = `선택한 역할은 ${roles_str} 입니다.`;
                role_message = showRoleMessage;
            } else {
                role_message = noRoleMessage;
            }
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: role_message.text,
                blocks: role_message.blocks,
            });
			res.json({});
            break;
        }
	  case "resetRoleMessage": {
            let rows = await libKakaoWork.mysql_query(
                `delete from push_role where user_id="${react_user_id}"`
            );
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: resetRoleMessage.text,
                blocks: resetRoleMessage.blocks,
            });
			res.json({});
            break;
        }
	  case "returnWelcome": {
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                text: welcomeMessage.text,
                blocks: welcomeMessage.blocks,
            });
			res.json({});
            break;
        }
		  
      default:
		  // res.json({ result: true });
  		  next();
		  break;
  }
});

module.exports = router;