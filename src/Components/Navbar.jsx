import { useState } from "react";
import styled from "styled-components";
import phonehand from "../assets/logo-avocarbon.png" 
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [Show, setShow] = useState(false);
    const smallScreen = window.screen.width <= 768 ? true : false;
 
    return (
        <Container>
            <LogoLink to="/">
                <img src={phonehand} width={140} height={30} />
            </LogoLink>
            <Menu style={{ display: smallScreen ? "none" : "flex" }}>
            <Link to="/">
                <Item>Home</Item>
                </Link>
                <Link to="/form">
                    <Item>Form</Item>
                </Link>
                <Link to="/map">
                    <Item>Location</Item>
                </Link>
                <Item>Contact</Item>
            </Menu>
            {smallScreen && <ShowItems onClick={() => setShow(!Show)}>|||</ShowItems>}
            <ResMenu style={{ display: Show ? "flex" : "none" }}>
                <Close onClick={() => setShow(false)}>Close</Close>
                <Item>Home</Item>
                <Item>Features</Item>
                <Item>Service</Item>
                <Item>Pricing</Item>
                <Item>Contact</Item>
            </ResMenu>
        </Container>
    );
}

const LogoLink = styled(Link)`
    margin-right: 2rem; /* Add margin between the logo and the menu */
`;

const Logo = styled.a`
    font-size: 2rem;
    text-decoration: underline crimson;
`;

const Container = styled.div`
    padding: 0 1rem;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* Aligns items to the left and right */
    background: #333; /* Set background color to black */
`;


const Menu = styled.ul`
    align-items: center;
    justify-content: space-evenly;
    width: 40%;
    margin-left: auto; /* Moves the menu to the right */
    cursor: pointer;
`;

const ShowItems = styled.button`
    position: absolute;
    top: .2rem;
    font-size: 1.7rem;
    padding: .2rem;
    rotate: 90deg;
    cursor: pointer;
`;

const Close = styled.button`
    position: absolute;
    top: 1rem;
    left: 1rem;
    padding: .3rem;
    color: gray;
`;

const ResMenu = styled.ul`
    width: 100vw;
    height: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    background: orange;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    z-index: 3;
    animation: menu .5s linear forwards;
    
    @keyframes menu {
        to {
            height: 16rem;
        }
    }
`;

const Item = styled.li`
    cursor: pointer;
    list-style: none;
    color: white;
    margin: 1rem;
`;

const Button = styled.button`
    height: 2rem;
    padding: 0 .6rem;
    border-radius: .5rem;
    border: 1px solid white;
    color: white;
    background: #046eaf;
    cursor: pointer;
    margin-left: 35%;
`;

export default Navbar;
