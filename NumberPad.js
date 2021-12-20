import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const FullsizeCanvas = styled.canvas`
    position: fixed;
    left: 0px;
    top: 0px;
    transform-origin: top left;
    z-index: 1301;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: black;
`;

const ui= [
    {x: 0, y: 0.0,  w: 0.85, h: 0.08, bgColor: "#222",    color: "#FFF", id: 'title'},
    {x: 0, y: 0.08, w: 1, h: 0.12, bgColor: "#FFFFFF", color: "#000", id: 'value'},

    {type: 'button', x: 0.85 , y: 0,  w: .15, h: 0.08, text: "X"},

    {type: 'button', x: 0   , y: 0.2,  w: .25, h: 0.2, text: "7"},
    {type: 'button', x: 0.25, y: 0.2,  w: .25, h: 0.2, text: "8"},
    {type: 'button', x: 0.5 , y: 0.2,  w: .25, h: 0.2, text: "9"},
    {type: 'button', x: 0.75, y: 0.2,  w: .25, h: 0.2, text: "Clr"},

    {type: 'button', x: 0   , y: 0.4,  w: .25, h: 0.2, text: "4"},
    {type: 'button', x: 0.25, y: 0.4,  w: .25, h: 0.2, text: "5"},
    {type: 'button', x: 0.5 , y: 0.4,  w: .25, h: 0.2, text: "6"},
    {type: 'button', x: 0.75, y: 0.4,  w: .25, h: 0.2, text: "<"},

    {type: 'button', x: 0   , y: 0.6,  w: .25, h: 0.2, text: "1"},
    {type: 'button', x: 0.25, y: 0.6,  w: .25, h: 0.2, text: "2"},
    {type: 'button', x: 0.5 , y: 0.6,  w: .25, h: 0.2, text: "3"},
    {type: 'button', x: 0.75, y: 0.6,  w: .25, h: 0.4, text: "Ok"},

    {type: 'button', x: 0   , y: 0.8,  w: .25, h: 0.2, text: "-"},
    {type: 'button', x: 0.25, y: 0.8,  w: .25, h: 0.2, text: "0"},
    {type: 'button', x: 0.5 , y: 0.8,  w: .25, h: 0.2, text: "."}
];

function drawButton(context, rect, x, y, w, h, text, pressed) {
    let dark='#D0D0D0';
    let light='#F0F0F0';
    if (text==='X'){
        dark='#440505';
        light='#991010';
    }
    x=x*rect.width;
    y=y*rect.height;
    h=h*rect.height;
    w=w*rect.width;
    context.beginPath();
    context.lineJoin='round';
    context.lineWidth=1;
    context.fillStyle=pressed?dark:light;
    context.moveTo(x,y);
    context.lineTo(x+w,y);
    context.lineTo(x+w,y+h);
    context.lineTo(x, y+h);
    context.closePath();
    context.fill();
    context.stroke();
    context.font=Math.min(w,h)/2+"px Arial";
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle='#111';
    context.fillText(text,x+w/2,y+h/2)
}
function drawText(context, rect, x, y, w, h, bgColor, color, text) {
    x=x*rect.width;
    y=y*rect.height;
    h=h*rect.height;
    w=w*rect.width;
    context.beginPath();
    context.lineJoin='round';
    context.lineWidth=1;
    context.fillStyle=bgColor;
    context.moveTo(x,y);
    context.lineTo(x+w,y);
    context.lineTo(x+w,y+h);
    context.lineTo(x, y+h);
    context.closePath();
    context.fill();
    context.stroke();
    context.font=Math.min(w,h)/2+"px Arial";
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle=color;
    context.fillText(text,x+w/2,y+h/2)
}

function changeSize(canvasRef, setSize, workingValueRef, titleRef, whichTouchedRef){
    if (!canvasRef.current) return;
    const width=window.visualViewport.width;
    const height=window.visualViewport.height;
    canvasRef.current.style.width=width+'px';
    canvasRef.current.style.height=height+'px';
    canvasRef.current.style.top=window.visualViewport.offsetTop+'px';
    canvasRef.current.style.left=window.visualViewport.offsetLeft+'px';

    setSize({width, height})

    redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
}

function redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef){
    if (!canvasRef.current) return;
    const rect=canvasRef.current.getBoundingClientRect();
    const context = canvasRef.current.getContext('2d');

    context.fillStyle = '#999999';
    context.fillRect(0, 0, rect.width, rect.height);

    let whichTouchedRefElement = null;
    if (whichTouchedRef.current){
        whichTouchedRefElement = whichTouchedRef.current.element;
    }

    for (const element of ui){
        if (element.type==="button"){
            drawButton(context, rect, element.x, element.y, element.w, element.h, element.text, whichTouchedRefElement===element?whichTouchedRef.current.pressed:false);
        }else{
            drawText(context, rect, element.x, element.y, element.w, element.h, element.bgColor, element.color, element.id==='title'?titleRef.current:workingValueRef.current);
        }
    }
}

export default function NumberPad({children, saveAndClose, initialValue, title, cancel}){
    const canvasRef = useRef(); 
    const [size, setSize] = useState({width: window.visualViewport.width, height: window.visualViewport.height});
    const workingValueRef = useRef(null);
    const titleRef = useRef(title);
    const whichTouchedRef = useRef(null);
    const enableClickRef = useRef(false);

    if (workingValueRef.current===null){
        workingValueRef.current=Number(initialValue);
        if (!isFinite(workingValueRef.current)) workingValueRef.current=0;
    }
    
    useEffect(()=>{
        const oldStyle = document.body.getAttribute("style");
        document.body.setAttribute("style","touch-action: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;");
        return ()=>document.body.setAttribute("style", oldStyle);
    }, []);

    useEffect(()=>{
        titleRef.current=title;
        changeSize(canvasRef, setSize, workingValueRef, titleRef, whichTouchedRef);
    }, [title]);

    useEffect(()=>{
        document.documentElement.scrollLeft=0;
        document.activeElement.blur();
        changeSize(canvasRef, setSize, workingValueRef, titleRef, whichTouchedRef);
    }, []);

    useEffect(()=>{
        const intervalId = setInterval(changeSize.bind(null, canvasRef, setSize, workingValueRef, titleRef, whichTouchedRef), 1000);
        return ()=>clearInterval(intervalId);
    }, []);

    

    useEffect(()=>{
        const handler = changeSize.bind(null, canvasRef, setSize, workingValueRef, titleRef, whichTouchedRef);
        window.visualViewport.addEventListener('resize', handler);
        window.visualViewport.addEventListener('scroll', handler);

        return ()=>{
            window.visualViewport.removeEventListener('resize', handler);
            window.visualViewport.removeEventListener('scroll', handler);
        }
    }, []);


    const updateDigits = (newDigits) => {
        if (newDigits==="") newDigits="0";
        workingValueRef.current=newDigits;
        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
    }
    
    const addDigit = (dig) => {
        const digits=String(workingValueRef.current);
        if (digits.indexOf(".")>=0 && dig===".") return;
        if (digits==="0" && dig==="0") return;
        if (digits==="0" && dig!=="0"){
            updateDigits(dig)
        }else{
            updateDigits(digits+dig);
        }
    }
    
    const minusClicked = () => {
        const digits=String(workingValueRef.current);
        if (digits==="0"){
            updateDigits("-");
        }else{
            if (digits[0]==="-"){
                updateDigits(digits.substr(1));
            }else{
                updateDigits("-"+digits);
            }
        }
    }
    
    const okClicked = () => {
        let returnVal=Number(workingValueRef.current);
        if (!isFinite(returnVal)) returnVal=0;
        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
        saveAndClose(String(returnVal));
    }
    
    const clearClicked = () => updateDigits("0")

    const backClicked = () => {
        const digits=String(workingValueRef.current);
        updateDigits(digits.substring(0, digits.length-1));
    }

    const touchDown = (e) => {
        const rect=e.target.getBoundingClientRect();
        let mX=(e.touches[0].clientX-rect.x)/rect.width;
        let mY=(e.touches[0].clientY-rect.y)/rect.height;

        whichTouchedRef.current=null;
        for (const element of ui){
            if (element.type==="button"){
                if (mX>=element.x && mX<=element.x+element.w && mY>=element.y && mY<=element.y+element.h){
                    whichTouchedRef.current={element: element, x: mX, y: mY, pressed: true};
                    break;
                }
            }
        }
        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
    }
    const touchMove = (e) => {
        if (!whichTouchedRef.current) return;

        const rect=e.target.getBoundingClientRect();
        let mX=(e.changedTouches[0].clientX-rect.x)/rect.width;
        let mY=(e.changedTouches[0].clientY-rect.y)/rect.height;

        if (whichTouchedRef.current){
            const elem = whichTouchedRef.current.element;
            whichTouchedRef.current.pressed=(mX>=elem.x && mX<=elem.x+elem.w && mY>=elem.y && mY<=elem.y+elem.h);
        }
        
        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
    }

    const action = (elem) => {
        switch (elem.text){
            case 'X':
                cancel();
                break;
            case 'Ok':
                okClicked(); 
                break;
            case 'Clr':
                clearClicked();
                break;
            case '<':
                backClicked();
                break;
            case '-':
                minusClicked();
                break;
            default:
                addDigit(elem.text);
        }
    }

    const touchUp = (e) => {
        e.preventDefault();
        if (!whichTouchedRef.current) return;

        const rect=e.target.getBoundingClientRect();
        let mX=(e.changedTouches[0].clientX-rect.x)/rect.width;
        let mY=(e.changedTouches[0].clientY-rect.y)/rect.height;


        if (whichTouchedRef.current){
            const elem = whichTouchedRef.current.element;
            whichTouchedRef.current.pressed=(mX>=elem.x && mX<=elem.x+elem.w && mY>=elem.y && mY<=elem.y+elem.h);
            if (whichTouchedRef.current.pressed){
                //Do actions
                action(elem);
            }
        }

        whichTouchedRef.current=null;

        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
    }
    const mouseClick = (e) => {
        if (enableClickRef.current===false) return;
        const rect=e.target.getBoundingClientRect();
        const mX=(e.clientX-rect.x)/rect.width;
        const mY=(e.clientY-rect.y)/rect.height;
        whichTouchedRef.current=null;
        for (const element of ui){
            if (element.type==="button"){
                if (mX>=element.x && mX<=element.x+element.w && mY>=element.y && mY<=element.y+element.h){
                    whichTouchedRef.current={element: element, x: mX, y: mY, pressed: true};
                    redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
                    setTimeout(()=>{
                        whichTouchedRef.current=null;
                        redraw(canvasRef, workingValueRef, titleRef, whichTouchedRef);
                        action(element);
                    },50);
                    break;
                }
            }
        }
    }

    return React.createElement(FullsizeCanvas, {
            ref:canvasRef,
            style:{width: size.width, height: size.height},
            width:size.width,
            height:size.height,
            onTouchStart:touchDown,
            onTouchMove:touchMove,
            onTouchEnd:touchUp,
            onClick:mouseClick,
            onPointerDown:()=>enableClickRef.current=true,
        },"Canvas not supported");
}