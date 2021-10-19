import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import "./index.scss";

import GameList from "./components/GameList";
import OverlayHeader from "./components/OverlayHeader";
import OverlayButton from "./components/OverlayButton";
import OverlayUserStatus from "./components/OverlayUserStatus";
import OverlaySearch from "./components/OverlaySearch";
import OverlayHelp from "./components/OverlayHelp";

function App() {
  const [savedData, setSavedData] = useState({
    steam: {
      popularNewReleases: {
        data: [],
        lastPage: 0,
        isMaxed: false,
        maxPages: 0,
      },
      newReleases: {
        data: [],
        lastPage: 0,
        isMaxed: false,
        maxPages: 0,
      },
    },
    global: {
      all: {
        data: [],
        lastPage: 0,
        isMaxed: false,
        maxPages: 0,
      },
    },
  });

  const [requestPermissions, setRequestPermissions] = useState({
    timeoutMs: 5000,
    canRequest: true,
  });

  const [selectedCategory, setSelectedCategory] = useState({
    category: "steam",
    subCategory: "popularNewReleases",
  });

  //Games State
  const [games, setGames] = useState([]);
  const [overlayVisibility, setOverlayVisibility] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [currentVote, setCurrentVote] = useState("");
  const [buttonMessage, setbuttonMessage] = useState("CAST YOUR VOTE");

  const handleScroll = (e) => {

    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom) {
      
      const storedObject = savedData[selectedCategory.category][selectedCategory.subCategory];

      console.log(storedObject);

      if (storedObject.lastPage > storedObject.maxPages   || !requestPermissions.canRequest) return;

      fetchAndSaveGames();
    }

  };

  const fetchGames = () => {
    const storedObject = savedData[selectedCategory.category][selectedCategory.subCategory];
    const lastPage = storedObject.lastPage;

    const URL = "http://localhost:5555/games/" + selectedCategoryFullPath() + "/" + lastPage;

    console.log("fetching ", URL);

    setRequestPermissions(prevState => {
      return {
        canRequest: false,
      }
    });

    setTimeout(() => {
      setRequestPermissions(prevState => {
        return {
          canRequest: true,
        }
      })
    }, 2000);

    const promise = fetch(URL)
		.then((res, rej) => res.json())
    .then(data => {

      setSavedData(prevState => {
        const temp = prevState[selectedCategory.category];
        console.log(temp);

        temp[selectedCategory.subCategory].maxPages = data.maxPages;
        temp[selectedCategory.subCategory].lastPage++;

        return {
          ...prevState,
          ...temp
        }
      })

      return data.data;

    });

    console.log(storedObject);

    return promise;
  };

  const fetchAndSaveGames = () => {
    fetchGames(selectedCategory)
		.then((data) => {

      //APPEND NEWLY REQUESTED GAMES TO STORAGE TO PREVENT REQUEST SPAMMING
      setSavedData((prevState) => {

        const temp = prevState;

        temp[selectedCategory.category][selectedCategory.subCategory]
				.data
				.push(...data);

        return {
          ...prevState,
          ...temp,
        };
      });
      
    });
  };

  //Overlay visibility
  const toggleOverlayVisibility = () => {
    console.log("changing visibility");
    setOverlayVisibility((prevState) => !prevState);  
  };

  //Categories
  const selectedCategoryFullPath = () =>
    selectedCategory.category + "/" + selectedCategory.subCategory;

  //Sending vote
  const sendVote = (voteObj) => {
    setCurrentVote(voteObj.title);
    toggleOverlayVisibility();

    if (currentVote !== "") {
      setbuttonMessage("VOTE WAS CHANGED");
    } else {
      setbuttonMessage("THANKS FOR VOTING");
    }
  };

  useEffect(
    function () {
      const savedDataObject =
        savedData[selectedCategory.category] &&
        savedData[selectedCategory.category][selectedCategory.subCategory];

      console.log(selectedCategory);

      const storedGames = savedDataObject.data;

      if (storedGames.length === 0) {
        fetchGames(selectedCategory)
          .then((data) => {
            //SHOW GAMES IN UI
            setGames(data);
            //APPEND NEWLY REQUESTED GAMES TO STORAGE TO PREVENT REQUEST SPAMMING
            setSavedData((prevState) => {
              const temp = prevState;
              temp[selectedCategory.category][selectedCategory.subCategory].data = data;
              return {
                ...prevState,
                ...temp,
              };
            });
            return data;
          })
          .then(() => {
            console.log("LOGGING SAVED DATA");
            console.log(savedData);
          });

      } else {
        console.log("no requset required");
        setGames(storedGames);
      }

      //After changing categories, set search value to nothing
      setSearchValue("");
    }, [selectedCategory]);


  const sideStyle = {
    maxWidth: 500,
    padding: "30px",
    minHeight: "100vh",
  };

  return (
    <div id="Overlay" onScroll={handleScroll}>
      
      <div id="OverlaySide" style={sideStyle} className={overlayVisibility ? "OverlaySide-visible" : ""}>
        
        <OverlayHeader      changeOverlayVisibility={toggleOverlayVisibility} />{" "}
        <OverlayUserStatus  currentVote={currentVote} />{" "}
        <OverlaySearch      changeCategory={setSelectedCategory} selectedCategory={selectedCategory} setSearchValue={setSearchValue}/>
        <OverlayHelp />

        <GameList searchValue={searchValue} sendVote={sendVote} data={games}/>

      </div>

      <OverlayButton overlayVisibility={overlayVisibility} toggleOverlayVisibility={toggleOverlayVisibility} buttonMessage={buttonMessage} setbuttonMessage={buttonMessage}/>

    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
