import react, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import ClearIcon from '@mui/icons-material/Close';
import Colors from 'src/utils/Colors';
import ParasolImg from 'src/assets/directmessage/parasol.png';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector, useAppDispatch } from 'src/hooks';
import { setUserCoin } from 'src/stores/UserStore';
import { chargingCoinReq } from 'src/api/chargingCoin';
interface Props {
  message: string;
}

export default function RequestFreindResultModal(props) {
  const [charging, setcharging] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.userId);
  const userCoin = useAppSelector((state) => state.user.userCoin);

  async function chargingCoin() {
    let body = {
      myInfo: {
        userId: userId,
      },
    };
    try {
      const result = await chargingCoinReq(body);
      if (result === 1) {
        console.log('코인 충전 성공(swipe.tsx)');
        dispatch(setUserCoin(userCoin + 3));
      } else {
        console.log('코인 충전 실패(swipe.tsx)');
      }
    } catch (error) {
      console.error('error(charging coin 하다가 에러, swipte.tsx참조)', error);
    }
  }

  const handleClick = () => {
    props.setAddFriendResult(0);
  };

  const addfriendResult = props.addFriendResult;

  switch (addfriendResult) {
    case 1: //친구요청을 성공했을 때
      return (
        <Wrapper className="requestResultWrapper">
          <RequestResultHeader>
            <TitleImage src={ParasolImg} width="30" />
            <TitleText>친구 요청 성공</TitleText>
            <ButtonWrapper onClick={handleClick}>
              <ClearIcon fontSize="large" sx={{ color: Colors.skyblue[2] }} />
            </ButtonWrapper>
          </RequestResultHeader>

          <RequestResultBody>
            <div>
              <div>친구요청을 보냈어요!👩‍❤️‍👨</div>
              <div>친구가 수락하면 채팅이 가능해요!</div>
            </div>
            <Buttons>
              <MyButton onClick={handleClick}>확인</MyButton>
            </Buttons>
          </RequestResultBody>
        </Wrapper>
      );
    case 3: //이미 친구이거나, 수락을 기다리고 있는 상태
      return (
        <Wrapper className="requestResultWrapper">
          <RequestResultHeader>
            <TitleImage src={ParasolImg} width="30" />
            <TitleText>친구 요청 실패</TitleText>
            <ButtonWrapper onClick={handleClick}>
              <ClearIcon fontSize="large" sx={{ color: Colors.skyblue[2] }} />
            </ButtonWrapper>
          </RequestResultHeader>

          <RequestResultBody>
            <AlreadyFriendMessage>
              <div> 이미 친구요청을 보낸적이 있어요😀 </div>
              <div>친구가 수락하면 채팅이 가능해요!</div>
            </AlreadyFriendMessage>
            <Buttons>
              <MyButton onClick={handleClick}>확인</MyButton>
            </Buttons>
          </RequestResultBody>
        </Wrapper>
      );
    default: //코인이 부족할때(paypal결제모달 3항연산자로 포함)
      return (
        <>
          {!charging ? (
            <Wrapper className="requestResultWrapper">
              <RequestResultHeader>
                <TitleImage src={ParasolImg} width="30" />
                <TitleText>친구 요청 결과</TitleText>
                <ButtonWrapper onClick={handleClick}>
                  <ClearIcon fontSize="large" sx={{ color: Colors.skyblue[2] }} />
                </ButtonWrapper>
              </RequestResultHeader>

              <RequestResultBody>
                <div>
                  <div>앗... 코인이 없어요!!🥲</div>
                  <div>코인을 충전해주세요!</div>
                </div>

                <Buttons>
                  <MyButton onClick={() => setcharging(true)}>코인충전</MyButton>
                  <MyRedButton onClick={handleClick}> 코인안충전</MyRedButton>
                </Buttons>
              </RequestResultBody>
            </Wrapper>
          ) : (
            <Wrapper className="requestResultWrapper">
              <RequestResultHeader>
                <ArrowBackIcon onClick={() => setcharging(false)} fontSize="large" />
                <TitleText>코인충전</TitleText>
                <ButtonWrapper onClick={handleClick}>
                  <ClearIcon fontSize="large" sx={{ color: Colors.skyblue[2] }} />
                </ButtonWrapper>
              </RequestResultHeader>

              <RequestResultBody>
                <div>코인 3개를 충전합니다</div>
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: '0.01',
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order!.capture().then((details) => {
                      // const name = details.payer.name.given_name;
                      chargingCoin();
                      alert(` 코인충전 완료!!💰`);
                      //서버로 3개올려달라고 말해주면 됨
                      handleClick();
                    });
                  }}
                />
              </RequestResultBody>
            </Wrapper>
          )}
        </>
      );
  }
}

const Wrapper = styled.div`
  position: fixed;
  left: 400px;
  background-color: ${Colors.white};
  gap: 10px;
  bottom: 200px;
  height: 250px;
  width: 370px;
  border-radius: 25px;
  box-shadow: 20px 0px 10px 0px rgba(0, 0, 0, 0.75);
  -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  font-style: normal;
  font-weight: 400;
`;

const RequestResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0px 10px 10px;
  width: 100%;
  height: 60px;
  position: relative;
  // display: grid;
  grid-template-columns: 90% 10%;
  background-color: ${Colors.skyblue[1]};
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  align-items: center;
`;

const TitleText = styled.div`
  font-weight: 600;
  font-size: 24px;
  font-size: 1.5rem;
`;
const TitleImage = styled.img`
  margin-left: 3px;
  margin-right: 13px;
  width: 28px;
`;
const ButtonWrapper = styled.button`
  background: none;
  border: none;
  padding: 0px 10px 0px 0px;
`;

const RequestResultBody = styled.div`
  font-weight: 600;
  font-size: 24px;
  font-size: 1.5rem;
  background-color: ${Colors.white};
  padding: 30px 15px 20px 15px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 190px;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
`;

const MyButton = styled.button`
  width: 120px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Ycomputer-Regular';
  border-radius: 10px;
  border: none;
  background-color: ${Colors.skyblue[1]};
  margin: 15px 10px 10px 10px;

  &:hover {
    background-color: ${Colors.skyblue[2]};
  }
`;

const MyRedButton = styled.button`
  width: 120px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Ycomputer-Regular';
  border-radius: 10px;
  border: none;
  background-color: ${Colors.pink[1]};
  margin: 15px 10px 10px 10px;

  &:hover {
    background-color: ${Colors.pink[2]};
  }
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AlreadyFriendMessage = styled.div`
  font-size: 22px;
`;
