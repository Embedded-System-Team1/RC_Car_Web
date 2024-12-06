#include <libwebsockets.h>
#include <string.h>
#include <stdio.h>
#include <wiringPi.h>

// GPIO 핀 정의
#define MOTOR_FORWARD_PIN 1
#define MOTOR_BACKWARD_PIN 2
#define MOTOR_LEFT_PIN 3
#define MOTOR_RIGHT_PIN 4

static int callback_rc_control(struct lws *wsi, enum lws_callback_reasons reason,
                                void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_ESTABLISHED:
            printf("클라이언트 연결됨\n");
            break;

        case LWS_CALLBACK_RECEIVE:
            if (in) {
                printf("메시지 수신: %s\n", (char *)in);

                // 메시지에 따라 GPIO 핀을 제어
                if (strcmp((char *)in, "FORWARD") == 0) {
                    digitalWrite(MOTOR_FORWARD_PIN, HIGH);
                } else if (strcmp((char *)in, "BACKWARD") == 0) {
                    digitalWrite(MOTOR_BACKWARD_PIN, HIGH);
                } else if (strcmp((char *)in, "LEFT") == 0) {
                    digitalWrite(MOTOR_LEFT_PIN, HIGH);
                } else if (strcmp((char *)in, "RIGHT") == 0) {
                    digitalWrite(MOTOR_RIGHT_PIN, HIGH);
                } else if (strcmp((char *)in, "STOP") == 0) {
                    // 모든 핀을 LOW로 설정하여 정지
                    digitalWrite(MOTOR_FORWARD_PIN, LOW);
                    digitalWrite(MOTOR_BACKWARD_PIN, LOW);
                    digitalWrite(MOTOR_LEFT_PIN, LOW);
                    digitalWrite(MOTOR_RIGHT_PIN, LOW);
                }
            }
            break;

        case LWS_CALLBACK_CLOSED:
            printf("클라이언트 연결 종료\n");
            break;

        default:
            break;
    }
    return 0;
}

static struct lws_protocols protocols[] = {
    {
        .name = "rc-control-protocol",
        .callback = callback_rc_control,
        .per_session_data_size = 0,
        .rx_buffer_size = 0,
    },
    { NULL, NULL, 0, 0 } // 종료를 나타내는 NULL 프로토콜
};

int main(void) {
    struct lws_context_creation_info info;
    struct lws_context *context;

    // GPIO 초기화
    if (wiringPiSetup() == -1) {
        fprintf(stderr, "WiringPi 초기화 실패\n");
        return -1;
    }

    pinMode(MOTOR_FORWARD_PIN, OUTPUT);
    pinMode(MOTOR_BACKWARD_PIN, OUTPUT);
    pinMode(MOTOR_LEFT_PIN, OUTPUT);
    pinMode(MOTOR_RIGHT_PIN, OUTPUT);

    memset(&info, 0, sizeof(info));
    info.port = 9000; // WebSocket 서버 포트
    info.protocols = protocols;

    context = lws_create_context(&info);
    if (!context) {
        fprintf(stderr, "WebSocket 서버 생성 실패\n");
        return -1;
    }

    printf("WebSocket 서버 시작, 포트: 9000\n");

    while (1) {
        lws_service(context, 1000);
    }

    lws_context_destroy(context);
    return 0;
}
