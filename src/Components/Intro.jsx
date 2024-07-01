import styled from "styled-components";
import woman from "../assets/pngegg.png"
import AnimatedShapes from "./AnimatedShapes";
import { Link } from 'react-router-dom';

const Intro = () => {
  const smallScreen = window.screen.width <= 480 ? true : false;
  
  return (
    <Container>
      <Left>
        <Title>
          <span style={{ color: '#046eaf',fontStyle: 'italic' }}>AVO</span>
          <span style={{ color: 'gray',fontStyle: 'italic' }}>Carbon</span> 
          <span style={{ color: '#ef7807' ,fontSize: '24px',fontStyle: 'italic'}}>Group</span> 
        </Title>
        <Desc>
          This application allows you to identify your competitors on a map and add information about them.
        </Desc>
        <Info>
          <Link to="/form">
          <Button>Form</Button>
          </Link>
          <Link to="/map">
          <ButtonM>Map</ButtonM>
          </Link>
        </Info>
        
      </Left>
      <Right>
        <h1 style={{  marginLeft: '20px',color: '#046eaf' }}>Competitor Mapping</h1>
        <img src={woman} alt="Woman" style={{  marginTop: '180px' }} />
        <Contact>
          <ContactText>For any question or concern</ContactText>
            <Email>Contact Us<br></br> taha.khiari@avocarbon.com<br></br>mootaz.farwa@avocarbon.com</Email>
            <ContactText>Powred By Same Tunisie Service</ContactText>
          </Contact>
        </Right>
      <AnimatedShapes />
    </Container>
  );

}
const Container = styled.div`
height:calc(100vh - 50px);
display:flex;
padding:20px
`;

const Left = styled.div`
width:60%;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
`;

const Title = styled.h1`
font-size:60px;
width:60%;
  @media only screen and (max-width: 480px) {
font-size:40px;
width: 100%;
  }
`;

const Desc = styled.p`
  width: 60%;
  font-size: 20px;
  margin-top: 20px;
  @media only screen and (max-width: 480px) {
    width: 100%;
  }
`;

const Info = styled.div`
  width: 60%;
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top:50px;
  
  @media only screen and (max-width: 480px) {
    flex-direction:column;
  }

`;
const Button = styled.button`
cursor:pointer;
padding:1rem; 
background:#046eaf;
color:#FFFFFF; 
border-radius:10px;
letter-spacing:2px;
font-weight: bold;
`;
const ButtonM = styled.button`
cursor:pointer;
padding:1rem; 
background:#046eaf;
color:#FFFFFF; 
border-radius:10px;
letter-spacing:2px;
font-weight: bold;
`;

const Contact = styled.div`
display:flex;
flex-direction:column;
@media only screen and (max-width: 480px) {
  display:none;
 }
`;

const Email = styled.span`
color:#0e4e78;
font-weight: bold;
`;

const ContactText = styled.span`
color:gray;
margin-top:5px;
`;

const Right = styled.div`
width:40%;
`;

const Image = styled.img`
width:50rem;
position:absolute;
bottom:0;
right:0%;

@media only screen and (max-width: 880px) {
  right:-20%;
 };

`;

export default Intro;