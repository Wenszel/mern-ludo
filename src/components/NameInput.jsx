import React, { useState, useContext } from "react";
import { SocketContext } from "../App";

const NameInput = () => {
  const socket = useContext(SocketContext);
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleButtonClick = () => {
    socket.emit("player:login", { name: inputValue });
  };
  return (
    <div>
      <input
        placeholder="Enter name"
        type="text"
        onChange={handleInputChange}
      />
      <input type="submit" onClick={handleButtonClick} />
    </div>
  );
};

export default NameInput;
