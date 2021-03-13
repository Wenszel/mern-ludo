import React, { useEffect } from 'react';

const Navbar = () => {
    const [names, setNames] = useState([]);
    useEffect(
        //fetching names, time and other data
    );
    return(
        <div>
            {names.map((name)=>{
                <h1>{name}</h1>
            })}
        </div>
    );
}