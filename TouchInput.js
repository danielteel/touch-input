import React, {useRef, useState, useEffect} from 'react';
import NumberPad from './NumberPad';

function getNumberLiteral(text) {
    if (typeof text!=="string") text=String(text);
    if (text.length<1) return "";
    let lookIndex=0;
    let hasDec = false;
    let num = "";

    while (text[lookIndex]===" "){//Eat whitespace at front
        lookIndex++;
    }

    const isDigit = (char) => (char && char.charCodeAt(0)>=48 && char.charCodeAt(0)<=57);

    if (text[lookIndex]==='-'){//Only allow a minus in front of number
        num="-";
        lookIndex++;
    }

    while (text[lookIndex]!==undefined) {
        if (isDigit(text[lookIndex])) {
            num+=text[lookIndex];
        }
        if (text[lookIndex] === '.' && !hasDec) { //Only allow one decimal point
            hasDec = true;
            num+=text[lookIndex];
        }
        lookIndex++;
    }

    return num;
}

export default function TouchInput({as, onChange, value, type, title, autoComplete, ...props}){
    const touchStartHere = useRef(false);
    const [showNumberPad, setShowNumberPad] = useState(false);
    const lastTouchTimeRef = useRef(null);

    if (!as) as='input';
    if (value !== undefined && value !== null) value = String(value);
    if (value===undefined || value===null) value = '';

    useEffect( () => {
        const handler = (e)=>{
            let inputType = type;
            if (typeof inputType!=='string') inputType='text';
            if (e.pointerType!=='mouse' && inputType.trim().toLowerCase()==='number'){
                lastTouchTimeRef.current = e.timeStamp;
            }
        }
        document.addEventListener('pointerup', handler);

        return ()=>document.removeEventListener('pointerup', handler);
    }, [type]);

    const inputProps = {
        ...props,
        key: '0',
        value,
        inputMode: type==='number'?'none':undefined,
        onSubmit: (e)=>e.preventDefault(),
        onPointerDown: (e)=>{
            if (e.pointerType!=='mouse' && type==='number'){
                touchStartHere.current=true;
            }
        },
        onPointerUp: (e)=>{
            if (e.pointerType!=='mouse' && type==='number'){
                if (touchStartHere.current){
                    if (document.elementFromPoint(e.clientX, e.clientY)===e.target){
                        setShowNumberPad(true);
                    }
                }
                touchStartHere.current=false;
            }
        },
        onFocus: (e)=>{
            if (Math.abs(e.timeStamp-lastTouchTimeRef.current)<500){
                setShowNumberPad(true);
                e.target.blur();
            }
        },
        onChange: (e)=>{
            if (type==='number'){
                const oldValue = value;
                const newInValue=e.target.value;
                let decCount=0;
                if (newInValue.length > oldValue.length){
                    for (const newChar of newInValue){
                        if (newChar==='.') decCount++;
                    }
                    if (decCount>1){
                        let newValue='';
                        let selIndex = null;
                        let selOffset=1;
                        for (const [index, newChar] of newInValue.split('').entries()){
                            if (newChar!==oldValue[index] && selIndex===null){
                                selIndex=index;
                                newValue+=newChar;
                            }else{
                                if (newChar!=='.') newValue+=newChar;
                                if (newChar==='.' && selIndex===null) selOffset=0;
                            }
                        }
                        setTimeout( ()=>{try{e.target.setSelectionRange(selIndex+selOffset, selIndex+selOffset)}catch{}}, 0);
                        e.target.value=newValue;
                    }
                }
                e.target.value=getNumberLiteral(e.target.value);
                if (oldValue===e.target.value){
                    let selIndex=null;
                    for (const [index, newChar] of newInValue.split('').entries()){
                        if (newChar!==oldValue[index]){
                            selIndex=index;
                            break;
                        }
                    }
                    setTimeout( ()=>{try{e.target.setSelectionRange(selIndex, selIndex)}catch{}}, 0);
                }else if (oldValue[0]==='-' && e.target.value[0]!=='-'){
                    if (oldValue.length < e.target.value.length){
                        setTimeout( ()=>{try{e.target.setSelectionRange(1, 1)}catch{}}, 0);
                    }else{
                        setTimeout( ()=>{try{e.target.setSelectionRange(0, 0)}catch{}}, 0);
                    }
                }
            }
            onChange(e.target.value)
        },
    };

    let numberPad = showNumberPad ? (
        React.createElement(NumberPad, {
            key: '1',
            initialValue:value,
            title,
            saveAndClose:(newVal)=>{
                onChange(newVal);
                setShowNumberPad(false);
            },
            cancel:()=>setShowNumberPad(false)
        })
    ):(
        null
    )

    return (
        React.createElement(React.Fragment, {}, [
            numberPad,
            autoComplete==='off' ?
                    React.createElement('form', {autoComplete: 'off', key:'2'}, React.createElement(as, inputProps, null))
                :
                    React.createElement(as, inputProps, null)
        ])
    );
}