import React, { useState } from 'react';
import {render, Text, useApp, useInput} from 'ink';


const KeyTracker = () => {
    const [lastPressed, setLastPressed] = useState('None');
    const { exit } = useApp();

    useInput((i, key) => {
       if (key.leftArrow){
           setLastPressed('<-')
       } else if (key.rightArrow){
           setLastPressed('->')
       } else if (i == 'q'){
           exit()
       }
    })

    return (
        <Text>
            The last key you typed was: <Text color="green">{lastPressed}</Text> (q to quit)
        </Text>
    );
}

render(<KeyTracker/>)
