const express = require('express');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');
const db = require('../db');

/*-------------------------------------------------------------------------------*/
// TEST - 한영규


router.post('/request', async (req, res, next) => {
  console.log(req.body);
  const { message, value } = req.body;

  switch (value) {
    case 'meeting_reservation':
	{
      // 설문조사용 모달 전송 (3)
      return res.json({
        view: {
          "title": "회의 예약",
		  "accept": "확인",
		  "decline": "취소",
		  "value": "meeting_reservation_results",
		  "blocks": [
			{
			  "type": "label",
			  "text": "온라인 or 오프라인 선택",
			  "markdown": true
			},
			{
			  "type": "select",
			  "name": "select_onoff",
			  "options": [
				{
				  "text": "온라인",
				  "value": "online"
				},
				{
				  "text": "오프라인",
				  "value": "offline"
				}
			  ],
			  "required": false,
			  "placeholder": "옵션을 선택해주세요"
			},
			{
			  "type": "label",
			  "text": "날짜 입력",
			  "markdown": true
			},
			{
			  "type": "input",
			  "name": "input_date",
			  "required": false,
			  "placeholder": "날짜를 입력해 주세요 ex) 05/14"
			},
			{
			  "type": "label",
			  "text": "회의 목적 입력",
			  "markdown": true
			},
			{
			  "type": "input",
			  "name": "input_purpose",
			  "required": false,
			  "placeholder": "회의 목적을 입력해 주세요 ex) 프로젝트 기획"
			}
		  ]
        },
      });
      break;
	}
    default:
		  next();
		  break;
  }

  // res.json({});
});


router.post('/callback', async (req, res, next) => {
  console.log(req.body);
  var { message, value } = req.body;

  switch (value) {
    case 'meeting_list':
	{
		  
      // 설문조사 응답 결과 메세지 전송 (3)
		  db.query('select * from meeting', async function(error,meetings){
			  text='';
			  for(let i=0;i<meetings.length;i++){
				  text+=`${meetings[i].date} | ${meetings[i].how} | ${meetings[i].purpose}\n`;
			  }
			  await libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				"text": "Push alarm message",
				  "blocks": [
					{
					  "type": "header",
					  "text": "현재 예약된 회의 목록입니다.",
					  "style": "blue"
					},
					{
					  "type": "text",
					  "text": `${text}`,
					  "markdown": true
					}
				  ]
			  });
		  });
		  return res.json({});
		  break;
	}
		  
	case 'meeting_reservation_results':
	{
		  const { actions } = req.body;
      // 설문조사 응답 결과 메세지 전송 (3)
		  
		  db.query(`insert into meeting (date, how, purpose) values(?,?,?)`,
          [actions.input_date, actions.select_onoff, actions.input_purpose], async function(error,result){
			  console.log(result);
			  await libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				"text": "Push alarm message",
				  "blocks": [
					{
					  "type": "header",
					  "text": "회의 예약에 성공했습니다.",
					  "style": "blue"
					},
					  {
						"type": "text",
						  "text": `${actions.input_date} | ${actions.select_onoff} | ${actions.input_purpose}`,
						  "markdown": true,
					  },
				  ]
			  });
		  });
	  return res.json({});
      break;
	}
    default:
		  next();
		  break;
  }

  // res.json({ result: true });
});


module.exports = router;