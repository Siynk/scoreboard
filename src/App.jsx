import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the icons
import buzzerSound from './assets/Buzzer.MP3';
import subSound  from './assets/Sub.MP3';
import endSound from './assets/End.MP3';


function App() {
  // State for storing the Home and Away scores
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // State for the timer
  const [time, setTime] = useState(600); // Time in seconds (10:00 = 600 seconds)
  const [shotClock, setShotClock] = useState(24); // Initial shot clock
  const [isRunning, setIsRunning] = useState(false); // Timer running state

  // Ref to store the interval ID
  const timerIntervalRef = useRef(null);
  const shotClockIntervalRef = useRef(null);

  // State for foul counters
  const [homeFouls, setHomeFouls] = useState([false, false, false, false, false]); // 5 fouls for Home
  const [awayFouls, setAwayFouls] = useState([false, false, false, false, false]); // 5 fouls for Away

  // State for modal visibility and custom time input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTime, setCustomTime] = useState({ minutes: 10, seconds: 0 });

  // State for modal visibility and custom score input
  const [isModalOpenScore, setIsModalOpenScore] = useState(false);
  const [customScore, setCustomScore] = useState({ score: 0 });


  const handleCustomScoreChange = (e) => {
    const { name, value } = e.target;
    setCustomScore((prevScore) => ({
      ...prevScore,
      [name]: value,
    }));
  };

  const setCustomScoreHandler = () => {
    // Assuming you have a function to update the actual scores of Home and Away
    setHomeScore(Number(customScore.home));
    setAwayScore(Number(customScore.away));
    setIsModalOpenScore(false); // Close the modal after setting the scores
  };
  
  // State for ball possession
  const [ballPossession, setBallPossession] = useState('home'); // 'home' or 'away'

  // State for tracking the current quarter
  const [currentQuarter, setCurrentQuarter] = useState(1);

  // Function to increment the score
  const incrementScore = (team, points) => {
    if (team === 'home') {
      setHomeScore(homeScore + points);
    } else {
      setAwayScore(awayScore + points);
    }
  };

  // Function to decrement the score, but prevent going below 0
  const decrementScore = (team) => {
    if (team === 'home' && homeScore > 0) {
      setHomeScore(homeScore - 1);
    } else if (team === 'away' && awayScore > 0) {
      setAwayScore(awayScore - 1);
    }
  };

  // Function to reset the score
  const resetScore = (team) => {
    if (team === 'home') {
      setHomeScore(0);
    } else {
      setAwayScore(0);
    }
  };

  // Function to start/stop the timer
  const toggleTimer = () => {
    const initialTime = 10 * 60; // Default time (10 minutes in seconds)

    if (isRunning) {
      // Stop both the main timer and shot clock
      clearInterval(timerIntervalRef.current);
      clearInterval(shotClockIntervalRef.current);
      setIsRunning(false); // Update state to reflect that the timer is stopped
    } else {
      // Start the main timer
      timerIntervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerIntervalRef.current); // Stop the timer when it reaches 0
            
            // Play buzzer sound when main timer hits 0
            const audio = new Audio(endSound);
            audio.play();

            // Reset the main timer to the default value (10 minutes)
            setTime(initialTime);

            // Stop the shot clock when main timer hits 0
            clearInterval(shotClockIntervalRef.current);
            setShotClock(24); // Reset shot clock to its initial value

            setIsRunning(false); // Update the button to "start" state
            return 0;
          }
        });
      }, 1000);

      // Start the shot clock (same interval as main timer, but only if shot clock > 0)
      shotClockIntervalRef.current = setInterval(() => {
        setShotClock((prevShotClock) => {
          if (prevShotClock > 0) {
            return prevShotClock - 1;
          } else {
            clearInterval(shotClockIntervalRef.current); // Stop shot clock when it reaches 0

            // Play buzzer sound ONLY when shot clock reaches 0
            const audio = new Audio(buzzerSound);
            audio.play();

            // Stop the main timer when shot clock hits 0
            clearInterval(timerIntervalRef.current); // Stop the main timer
            setIsRunning(false); // Update the state to reflect that the main timer is stopped

            setShotClock(24); // Reset shot clock to 24
            return 0;
          }
        });
      }, 1000);

      setIsRunning(true); // Update the button to "stop" state while the timer is running
    }
  };

  // Function to reset the shot clock
  const resetShotClock = (time) => {
    setShotClock(time);
  };

  // Function to format the time as mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Toggle foul color (red/normal) for a team
  const toggleFoul = (team, index) => {
    if (team === 'home') {
      const newFouls = [...homeFouls];
      newFouls[index] = !newFouls[index];
      setHomeFouls(newFouls);
    } else {
      const newFouls = [...awayFouls];
      newFouls[index] = !newFouls[index];
      setAwayFouls(newFouls);
    }
  };

  // Function to handle custom time input
  const handleCustomTimeChange = (e) => {
    const { name, value } = e.target;
    setCustomTime((prevTime) => ({
      ...prevTime,
      [name]: value,
    }));
  };

  // Function to set the custom time
  const setCustomTimeHandler = () => {
    const totalSeconds = customTime.minutes * 60 + parseInt(customTime.seconds, 10);
    setTime(totalSeconds);
    setIsModalOpen(false); // Close the modal after setting the time
  };

  // Function to toggle ball possession
  const toggleBallPossession = (team) => {
    setBallPossession(team);
  };

  const updateQuarter = (e) => {
    if (e.type === 'click') {
      setCurrentQuarter((prevQuarter) => {
        if (typeof prevQuarter === 'number' && prevQuarter < 4) {
          return prevQuarter + 1; // Proceed to the next quarter (Q1-Q4)
        } else if (prevQuarter === 4) {
          return 'OT1'; // Switch to OT1 after Q4 (no 'Q' in OT)
        } else if (typeof prevQuarter === 'string' && prevQuarter.startsWith('OT')) {
          const otNumber = parseInt(prevQuarter.replace('OT', ''), 10);
          return `OT${otNumber + 1}`; // Proceed to the next overtime period (OT2, OT3, etc.)
        }
        return prevQuarter;
      });
    } else if (e.type === 'contextmenu') {
      e.preventDefault(); // Prevent the default right-click menu
      setCurrentQuarter(1); // Reset to Q1 on right-click
    }
  };
  
  // Cleanup the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (isRunning) {
        clearInterval(timerIntervalRef.current);
        clearInterval(shotClockIntervalRef.current);
      }
    };
  }, [isRunning]);

  return (
    <>
      <header>
        <h1>BASKETBALL SCOREBOARD</h1>
      </header>

      <div className="counter-container">
        {/* Home Counter */}
        <div className="counter">
          <h2 className='title'>Home</h2>
          <div className="buttons">
            <div className="buttons-left">
              <button onClick={() => incrementScore('home', 1)}>+1</button>
              <button onClick={() => incrementScore('home', 2)}>+2</button>
              <button onClick={() => incrementScore('home', 3)}>+3</button>
            </div>
            <h2 className="scores">{homeScore < 10 ? `0${homeScore}` : homeScore}</h2>
            <div className="buttons-right">
              <button onClick={() => decrementScore('home')}>-1</button>
              <button onClick={() => setIsModalOpenScore(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button onClick={() => resetScore('home')}>Reset</button>
            </div>
            <div className='fouls-counter'>
              <h3>Fouls</h3>
              {homeFouls.map((foul, index) => (
                <div
                  key={index}
                  className={`circle ${foul ? 'red' : ''}`}
                  onClick={() => toggleFoul('home', index)}
                ></div>
              ))}
            </div>

            <div className='time-out-left'>  
            <button onClick={() => new Audio(buzzerSound).play()}>Timeout</button>
            </div>

            <div className='substitution-left'>
            <div className='substitution-left'>
              <button onClick={() => new Audio(subSound).play()}>Substitution</button>
            </div>
            </div>

          </div>
        </div>

        {/* Timers Container */}
        <div className="timers-container">
          {/* Main Timer */}
          <button onClick={() => setIsModalOpen(true)}>Edit Time</button>
          <div className="timer">
            <h2>{formatTime(time)}</h2>
            <button onClick={toggleTimer}>{isRunning ? 'Stop' : 'Start'}</button>
          </div>

          {/* Ball Possession */}
          <div className="ball-possession">
            <button
              onClick={() => toggleBallPossession('home')}
              style={{
                backgroundColor: ballPossession === 'home' ? 'yellow' : 'gray',
                color: ballPossession === 'home' ? 'black' : 'white',
              }}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <button
              onClick={() => toggleBallPossession('away')}
              style={{
                backgroundColor: ballPossession === 'away' ? 'yellow' : 'gray',
                color: ballPossession === 'away' ? 'black' : 'white',
              }}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </div>

            {/* Quarters */}
            <div className="quarters">
              <button 
                onClick={updateQuarter} 
                onContextMenu={updateQuarter} 
                title="Right click to reset quarter"  // Tooltip for right-click action
              >
                {typeof currentQuarter === 'string' && currentQuarter.startsWith('OT') 
                  ? currentQuarter  // Directly display OT1, OT2, etc. without 'Q'
                  : `Q${currentQuarter}`}  {/* Regular quarters display as Q1, Q2, etc. */}
              </button>
            </div>
          {/* ShotClock Timer */}
          <div className="shotclock-timer">
            <h2>{shotClock}</h2>
            <button onClick={() => resetShotClock(24)}>24 Reset</button>
            <button onClick={() => resetShotClock(14)}>14 Reset</button>
          </div>
        </div>

        {/* Away Counter */}
        <div className="counter">
          <h2 className='title'>Away</h2>
          <div className="buttons">
            <div className="buttons-left">
              <button onClick={() => incrementScore('away', 1)}>+1</button>
              <button onClick={() => incrementScore('away', 2)}>+2</button>
              <button onClick={() => incrementScore('away', 3)}>+3</button>
            </div>
            <h2 className="scores">{awayScore < 10 ? `0${awayScore}` : awayScore}</h2>
            <div className="buttons-right">
              <button onClick={() => decrementScore('away')}>-1</button>
              <button onClick={() => setIsModalOpenScore(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button onClick={() => resetScore('away')}>Reset</button>
            </div>
            <div className='fouls-counter'>
              <h3>Fouls</h3>
              {awayFouls.map((foul, index) => (
                <div
                  key={index}
                  className={`circle ${foul ? 'red' : ''}`}
                  onClick={() => toggleFoul('away', index)}
                ></div>
              ))}
            </div>
          </div>

          <div className='time-out-left'>  
              <button onClick={() => new Audio(buzzerSound).play()}>Timeout</button>
            </div>

            <div className='substitution-left'>
            <button onClick={() => new Audio(subSound).play()}>Substitution</button>
            </div>

        </div>
      </div>

      {/* Modal for Custom Time */}
      {isModalOpen && (
        <div className="modal-EditTime">
          <div className="modal-content-EditTime">
            <label>
              Minutes:
              <input
                type="number"
                name="minutes"
                value={customTime.minutes}
                onChange={handleCustomTimeChange}
                min="0"
              />
            </label>
            <label>
              Seconds:
              <input
                type="number"
                name="seconds"
                value={customTime.seconds}
                onChange={handleCustomTimeChange}
                min="0"
                max="59"
              />
            </label>
            <button onClick={setCustomTimeHandler}>Set Time</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      
      {isModalOpenScore && (
      <div className="modal-EditScore">
        <div className="modal-content-EditScore">
          <label>
            Home Score:
            <input
              type="number"
              name="home"
              value={customScore.home || ''}
              onChange={handleCustomScoreChange}
              min="0"
            />
          </label>
          <label>
            Away Score:
            <input
              type="number"
              name="away"
              value={customScore.away || ''}
              onChange={handleCustomScoreChange}
              min="0"
              max="59"
            />
          </label>
          <button onClick={setCustomScoreHandler}>Set Score</button>
          <button onClick={() => setIsModalOpenScore(false)}>Cancel</button>
        </div>
      </div>
    )}

    </>
  );
}

export default App;
