import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';

import Logan from '../images/login/Logan_login.png';
import Kevin from '../images/login/Kevin_login.png';
import Zoey from '../images/login/Zoey_login.png';
import Emma from '../images/login/Emma_login.png';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  ENTERING_PROCESS,
  setCharacterSelected,
  setUserId,
  setUsername,
} from '../stores/UserStore';
import { getAvatarString, getColorByString } from '../util';
import Cookies from 'universal-cookie';
import phaserGame from '../PhaserGame';
import Game from '../scenes/Game';
const cookies = new Cookies();

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222639;
  border-radius: 16px;
  padding: 36px 60px;
  box-shadow: 0px 0px 5px #0000006f;
`;

const Title = styled.h3`
  margin: 5px;
  font-size: 25px;
  color: #c2c2c2;
  text-align: center;
`;

const RoomName = styled.div`
  max-width: 500px;
  max-height: 120px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 24px;
    color: #eee;
  }
`;

const RoomDescription = styled.div`
  max-width: 500px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 16px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
`;

const SubTitle = styled.h3`
  width: 200px;
  font-size: 16px;
  color: #eee;
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  margin: 36px 0;
`;

const Left = styled.div`
  margin-right: 48px;

  --swiper-navigation-size: 24px;

  .swiper {
    width: 160px;
    height: 220px;
    border-radius: 8px;
    overflow: hidden;
  }

  .swiper-slide {
    width: 160px;
    height: 220px;
    background: #dbdbe0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 95px;
    height: 136px;
    object-fit: contain;
  }
`;

const Right = styled.div`
  width: 300px;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Warning = styled.div`
  margin-top: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const avatars = [
  { name: 'logan', img: Logan },
  { name: 'kevin', img: Kevin },
  { name: 'zoey', img: Zoey },
  { name: 'emma', img: Emma },
];

// shuffle the avatars array
for (let i = avatars.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [avatars[i], avatars[j]] = [avatars[j], avatars[i]];
}

export default function CharacterSelectionDialog(props) {
  const [name, setName] = useState<string>(props.player || '');
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const videoConnected = useAppSelector((state) => state.user.videoConnected);
  const enteringProcess = useAppSelector((state) => state.user.enteringProcess);
  const roomName = useAppSelector((state) => state.room.roomName);
  const roomDescription = useAppSelector((state) => state.room.roomDescription);
  const game = phaserGame.scene.keys.game as Game;
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name === '') {
      setNameFieldEmpty(true);
    } else if (enteringProcess === ENTERING_PROCESS.CHARACTER_SELECTION) {
      console.log('Join! Name:', name, 'Avatar:', avatars[avatarIndex].name);
      game.registerKeys();
      game.myPlayer.setPlayerName(name);
      game.myPlayer.setPlayerTexture(avatars[avatarIndex].name);
      game.network.readyToConnect();
      dispatch(setUsername(name));
      dispatch(setCharacterSelected(true));
    }
  };

  useEffect(() => {
    if (game && game.myPlayer && props.hasToken && props.playerName && props.playerTexture) {
      game.registerKeys();
      game.myPlayer.setPlayerName(props.playerName || name);
      game.myPlayer.setPlayerTexture(props.playerTexture || avatars[avatarIndex].name);
      game.network.readyToConnect();
      dispatch(setCharacterSelected(true));
    }
  }, [game, game?.myPlayer]);

  if (props.hasToken && props.playerName && props.playerTexture) return <></>;
  return (
    <Wrapper onSubmit={handleSubmit}>
      <Title>입장하기</Title>
      <RoomName>
        <Avatar style={{ background: getColorByString(roomName) }}>
          {getAvatarString(roomName)}
        </Avatar>
        <h3>{roomName}</h3>
      </RoomName>
      <RoomDescription>
        <ArrowRightIcon /> {roomDescription}
      </RoomDescription>
      <Content>
        <Left>
          <SubTitle>어떤 모습으로 들어갈까요?</SubTitle>
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              setAvatarIndex(swiper.activeIndex);
            }}
          >
            {avatars.map((avatar) => (
              <SwiperSlide key={avatar.name}>
                <img src={avatar.img} alt={avatar.name} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Left>
        <Right>
          <TextField
            autoFocus
            fullWidth
            label="나의이름"
            variant="outlined"
            color="secondary"
            error={nameFieldEmpty}
            helperText={nameFieldEmpty && '이름이 필요해요'}
            value={name}
            inputProps={{ maxLength: 10 }}
            onInput={(e) => {
              setName((e.target as HTMLInputElement).value);
            }}
          />
          {!videoConnected && (
            <Warning>
              <Alert variant="outlined" severity="warning">
                <AlertTitle> 🤣아차! </AlertTitle>
                마이크가 연결되지 않았어요 <strong>마이크를 연결하면</strong> 친구들과 대화할 수
                있어요
              </Alert>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  game.network.webRTC?.getUserMedia();
                }}
              >
                마이크 연결하기
              </Button>
            </Warning>
          )}

          {videoConnected && (
            <Warning>
              <Alert variant="outlined"> 마이크도 쓸 수 있어요!</Alert>
            </Warning>
          )}
        </Right>
      </Content>
      <Bottom>
        <Button variant="contained" color="secondary" size="large" type="submit">
          헌팅하러 가기
        </Button>
      </Bottom>
    </Wrapper>
  );
}
