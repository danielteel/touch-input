import React, {useRef, useState, useEffect} from 'react';
import NumberPad from './NumberPad';



export default function TouchInput({as, onChange, value, type, title, autoComplete, ...props}){
    const touchStartHere = useRef(false);
    const [showNumberPad, setShowNumberPad] = useState(false);
    const lastTouchTimeRef = useRef(null);

    if (!as) as='input';
    if (value !== undefined && value !== null) value = String(value);
    if (value===undefined || value===null) value = '';

    useEffect( () => {
        const handler = (e)=>{
            if (e.pointerType!=='mouse' && type.toLowerCase().trim()==='number'){
                lastTouchTimeRef.current = e.timeStamp;
            }
        }
        document.addEventListener('pointerup', handler);

        return ()=>document.removeEventListener('pointerup', handler);
    }, [type]);

    const inputProps = {
        ...props,
        value,
        inputMode: type==='number'?'none':undefined,
        onSubmit: (e)=>e.preventDefault(),
        onPointerDown: (e)=>{
            if (e.pointerType!=='mouse' && type==='number'){
                touchStartHere.current=true;setShowNumberPad(true);
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
        onChange: (e)=>onChange(e.target.value),
    };

    let numberPad = showNumberPad ? (
        <NumberPad
            initialValue={value}
            title={title}
            saveAndClose={(newVal)=>{
                onChange(newVal);
                setShowNumberPad(false);
            }}
            cancel={()=>setShowNumberPad(false)}
        />
    ):(
        null
    )

    return (
        <>
            {numberPad}
            {   autoComplete==='off' ?
                    <form autoComplete='off'>
                        {React.createElement(as, inputProps, null)}
                    </form>
                :
                    React.createElement(as, inputProps, null)
            }
        </>
    );
}