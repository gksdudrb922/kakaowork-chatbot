const express = require("express");
const router = express.Router();

const addRoleModal = require("../blockKit/pushMessage/addRoleModal");
let selectRoleModal = require("../blockKit/pushMessage/selectRoleModal");
let sendMessageModal = require("../blockKit/pushMessage/sendMessageModal");

const libKakaoWork = require("../libs/kakaoWork");
// routes/post.js
router.post("/", async (req, res, next) => {
    const { message, value, react_user_id } = req.body;
    console.log(value);
    switch (value) {
        case "addRoleModal": {
            res.json({ view: addRoleModal });
            break;
        }
        case "selectRoleModal": {
            let rows = await libKakaoWork.mysql_query(
                `select distinct role from push_role;`
            );
			console.log(rows);
            if (rows.length <= 0) {
                libKakaoWork.sendMessage({
                    conversationId: message.conversation_id,
                    text: noExistRoleMessage.text,
                    blocks: noExistRoleMessage.blocks,
                });
                break;
            }
            const roles = rows.map((row) => {
                return { text: row.role, value: row.role };
            });
            selectRoleModal.blocks[1].options = roles;
			
            return res.json({ view: selectRoleModal });
            res.json({});
            break;
        }

        case "sendMessageModal": {
            let rows = await libKakaoWork.mysql_query(
                `select distinct role from push_role;`
            );
			if(rows.length!==0){
				const roles = rows.map((row) => {
					return { text: row.role, value: row.role };
				});
				sendMessageModal.blocks[1].options = roles;
				res.json({ view: sendMessageModal });
			}else{
				await libKakaoWork.sendMessage({
					conversationId: message.conversation_id,
					text: noExistRoleMessage.text,
					blocks: noExistRoleMessage.blocks,
				});
			}
			res.json({});
            break;
        }
        
        default: {
            // res.json({});
			next();
            break;
        }
    }
});

module.exports = router;
