// routes/index.js
const express = require("express");
const router = express.Router();

const libKakaoWork = require("../libs/kakaoWork");
const welcomeMessage = require("../blockKit/WelcomeMessage");
router.get("/", async (req, res, next) => {
    // 유저 목록 검색 (1)
    const users = await libKakaoWork.getUserList();

    // 검색된 모든 유저에게 각각 채팅방 생성 (2)
    const conversations = await Promise.all(
        users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
    );

    // 생성된 채팅방에 메세지 전송 (3)
    const messages = await Promise.all([
        conversations.map((conversation) =>
            libKakaoWork.sendMessage({
                conversationId: conversation.id,
                text: welcomeMessage.text,
                blocks: welcomeMessage.blocks,
            })
        ),
    ]);

    // 응답값은 자유롭게 작성하셔도 됩니다.
    res.json({
        users,
        conversations,
        messages,
    });
	// next();
});

module.exports = router;
