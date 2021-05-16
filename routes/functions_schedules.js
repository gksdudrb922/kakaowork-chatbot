const express = require('express');
const router = express.Router();

const libKakaoWork = require("../libs/kakaoWork");
const noExistSchedule = require("../blockKit/scheduleMessage/noExistingSchedule");
const showSchedule = require("../blockKit/scheduleMessage/showScheduleMessage");
const selectSchedule = require("../blockKit/scheduleMessage/selectScheduleModal");

router.post('/request', async (req, res, next) => {
    console.log(req.body);
    const { message, value } = req.body;
    switch(value){
            case 'setSchedule':{
                console.log("setSchedule init\n");
                return res.json({
                    view:selectSchedule
                });
                break;
            }
    }
})

router.post('/callback', async(req, res, next) => {
    const {message, value} = req.body;
    
    switch(value){
        case 'setSchedule':{
            /*
            DB Settings
            startdate: varchar(10)
            enddate: varchar(10)
            name: varchar(20)
            type: int
            */
            const { actions } = req.body;
            console.log(`INSERT INTO schedules VALUE("${actions.input_start_date}", "${actions.input_end_date}", "${actions.input_name}", ${actions.select_schedule});`);
            await libKakaoWork.mysql_query(`INSERT INTO schedules VALUE("${actions.input_start_date}", "${actions.input_end_date}", "${actions.input_name}", ${actions.select_schedule});`)
            let text_type = "";
            switch(actions.select_schedule){
                    case '0':{
                        text_type = "휴가";
                        break;
                    }
                    case '1':{
                        text_type = "병가";
                        break;
                    }
                    case '2':{
                        text_type = "개인사유";
                        break;
                    }
            }
            libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: "Push alarm message",
				blocks: [
					{
					  "type": "header",
					  "text": "일정 등록에 성공했습니다.",
					  "style": "blue"
					},
					  {
						"type": "text",
						  "text": `${actions.input_start_date} | ${actions.input_end_date} | ${actions.input_name} | ${text_type}`,
						  "markdown": true,
					  },
				  ]
			});
            res.json({});
            break;
        }
        case 'showSchedule':{
                console.log("showSchedule init");
                let res_schedule = await libKakaoWork.mysql_query(`select * from schedules;`);
                if (res_schedule.length == 1){
                    console.log("no schedule exist");
                    libKakaoWork.sendMessage({
                        conversationId: message.conversation_id,
                        text: noExistSchedule.text,
                        blocks: noExistSchedule.blocks,
                });
                }
                else{
                    let res_blocks = showSchedule.blocks;
                    res_blocks[1].text = "";
                    for(let a=1;a<res_schedule.length;a++){
                        let text_type = "";
                        console.log(res_schedule[a].startdate);
                        switch(res_schedule[a].type){
                            case 0:{
                                text_type = "휴가";
                                break;
                            }
                            case 1:{
                                text_type = "병가";
                                break;
                            }
                            case 2:{
                                text_type = "개인사유";
                                break;
                            }
                        }
                        res_blocks[1].text += `${res_schedule[a].startdate} ~ ${res_schedule[a].enddate} | ${res_schedule[a].name} | ${text_type}\n`
                    }
                    console.log(res_blocks);
                    libKakaoWork.sendMessage({
                        conversationId: message.conversation_id,
                        text: showSchedule.text,
                        blocks: res_blocks
                    });
                }
                res.json({});
                break;
            }
    }
});
module.exports = router;