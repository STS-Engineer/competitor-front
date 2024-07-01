
import styled from "styled-components";
import Navbar from "./Components/Navbar"
import Intro from "./Components/Intro";
import Feature from "./Components/Feature";
import Service from "./Components/Service";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import Price from "./Components/Price";
const Homepage  = ()=> {

    const Container = styled.div`
    width:100%;
    overflow:hidden;
    position:relative;
    `
    const Shape = `
    width:100%;
    height:100%;
    position:absolute;
    top:0;
    left:0;
    z-index:-1;
    `;
    
    const IntroShape = styled.div`
    ${Shape};
    background:#ef7807;
    clip-path: polygon(67% 0, 100% 0, 100% 100%, 55% 100%);
    `
    const FutureShape = styled.div`
    ${Shape};
    clip-path: polygon(0 0, 55% 0%, 33% 100%, 0 100%);
    background-color: #046eaf;
    `
    const ServiceShape = styled.div`
      ${Shape}
      clip-path: polygon(0 0, 33% 0%, 33% 100%, 0 100%);
      background-color: #f88497;
    `;
    
    const PriceShape = styled.div`
      ${Shape};
      clip-path: polygon(33% 0, 100% 0%, 100% 100%, 67% 100%); 
      background-color: crimson;
    `;
    
return (<div>
     <Container>
        <Navbar />
        <Intro />
        <IntroShape />
      </Container>

      <Container>
        <Feature />
        <FutureShape />
      </Container>


</div>);


}
export default Homepage;