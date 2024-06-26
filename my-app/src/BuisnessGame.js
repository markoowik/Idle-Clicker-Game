import {useState, useEffect, useRef} from 'react'
import Location from './Component/Location';
import backgroundMusic from './Audio/please-calm-my-mind-125566.mp3'
import backgroundImage from './Photo/Fone.webp'
import greenCrystal from './Photo/greenCrystal.png'
import backgroundImageRev from './Photo/FoneRev.png'
import menuIcon from './Photo/menuIcon.png'
import RundomButton from './Component/RandomEvent'

const BusinessWindow = ({
  name,
  income,
  onUpgrade,
  upgradeCost,
  level,
  unlocked,
  onUnlock,
  unlockCost,
  multiplier,
  convertNumberToShortForm,
  sciencePoints // Предполагаем, что sciencePoints передаются как prop
}) => {
  const isFifthUpgrade = (level + 1) % 5 === 0; // Проверяем, является ли следующий уровень пятым

  if (!unlocked) {
    return (
      <button 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-110"
        onClick={onUnlock}
      >
        Unlock for ${unlockCost}
      </button>
    );
  }

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className="bg-gray-700 p-5 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4">{name}</h3>
      <p className="text-xl mb-4">Income: <span className="font-bold">${convertNumberToShortForm(income.toFixed(2) * multiplier.toFixed(2))}</span> per second</p>
      <p className="text-xl mb-4">Your Level: <span className="font-bold">{level}</span></p>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-110"
        onClick={onUpgrade}
        disabled={isFifthUpgrade && sciencePoints < 1} // Отключить кнопку, если это пятое улучшение и не хватает очков науки
      >
        {isFifthUpgrade ? `Upgrade for ${convertNumberToShortForm(upgradeCost.toFixed(2))} and 1 🧪 ` : `Upgrade for ${convertNumberToShortForm(upgradeCost.toFixed(2))}`}
      </button>
    </div>
  );
};


const BuisnessGame = () => {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('balance')) || 0);
  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem('income');
      return savedIncome ? Number(savedIncome) : 1;
    });
  const resetGame = () => {

    if (researchIntervalId !== null) {
      clearInterval(researchIntervalId);
      setResearchIntervalId(null);
    }
    setResearchCost(0);
    setPayment(0);
    setDebt(0);
    setTaxes(0);
    setIsResearching(false);
    setPurchasedLocations(false);
    setPurchasedUpgrade(false);
    setGreenCrystals(1000);
    setSciencePoints(0)
    // Сброс состояний до начальных значений
    setBalance(0);
    setIncome(1);
    setUpgradeCost(10);
    setUpgradeCount(0);

    setSecondWindowUnlocked(false);
    setSecondIncome(0);
    setSecUpgradeCost(100);
    setSecUpgradeCount(0);

    setThirdWindowUnlocked(false);
    setThirdIncome(0);
    setThirdUpgradeCost(10000);
    setThirdUpgradeCount(0);

    setFirstBusinessMultiplier(1);
    setSecondBusinessMultiplier(1);
    setThirdBusinessMultiplier(1);


    // Очистка localStorage
    localStorage.clear();
  };

  const [researchIntervalId, setResearchIntervalId] = useState(null);
  // Функция для начала исследования
  const [researchCost, setResearchCost] = useState(() => {
    const initialCost = Number(localStorage.getItem('researchCost'));
    return initialCost >= 0 ? initialCost : 0; // Если стоимость уже есть в localStorage, используем ее, иначе начинаем с 0
  });

  const startResearch = () => {
    // Если уже идет исследование или нет средств, ничего не делаем
    if (isResearching || balance < researchCost) {
      if (balance < researchCost) {
        alert('Недостаточно средств для исследования');
      }
      return;
    }
    
    setIsResearching(true);
    setBalance((currentBalance) => currentBalance - researchCost);
    const endTime = Date.now() + researchTimeLeft * 1000;
    localStorage.setItem('researchEndTime', endTime);
    beginResearchTimer(endTime);
  };
  
  const beginResearchTimer = (endTime) => {
    // Устанавливаем новый таймер и сразу же сохраняем его ID
    const intervalId = setInterval(() => {
      const timer = (endTime - Date.now()) / 1000;
      setResearchTimeLeft(timer);
  
      if (timer <= 0) {
        clearInterval(intervalId);
        finishResearch();
      }
    }, 1000);
    setResearchIntervalId(intervalId);
  };
  
  const finishResearch = () => {
    setSciencePoints((prevPoints) => prevPoints + 1);
    setResearchTimeLeft(60);
    localStorage.removeItem('researchEndTime');
    
    const nextCost = researchCost === 0 ? 100 : Math.floor(researchCost * 1.5);
    setResearchCost(nextCost);
    localStorage.setItem('researchCost', nextCost.toString());
    
    setIsResearching(false);
    // Не забудьте сбросить ID интервала
    setResearchIntervalId(null);
  };
  
  useEffect(() => {
    return () => {
      if (researchIntervalId !== null) {
        clearInterval(researchIntervalId);
      }
    };
  }, [researchIntervalId]);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('researchEndTime');
    const currentTime = Date.now();
    
    if (savedEndTime && currentTime < savedEndTime) {
      setIsResearching(true);
      beginResearchTimer(Number(savedEndTime));
    } else {
      setResearchTimeLeft(60);
      setIsResearching(false);
      localStorage.removeItem('researchEndTime');
    }
  }, []);

  // Отображение лаборатории
  const toggleLab = () => {
    if (isStoreOpen) setIsStoreOpen(false);
    if (isMenuOpen) setIsMenuOpen(false);
    setIsLabOpen(!isLabOpen);
  };


  const [isPlaying, setIsPlaying] = useState(false);
const audioRef = useRef(new Audio(backgroundMusic));

useEffect(() => {
  // Управление воспроизведением музыки должно происходить только при изменении isPlaying
  if (isPlaying) {
    // Проигрываем музыку, если isPlaying === true
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log(`Не удалось воспроизвести звук: ${e}`);
      });
    }
  } else {
    // Останавливаем музыку, если isPlaying === false
    audioRef.current.pause();
  }

  // Устанавливаем loop здесь, чтобы гарантировать, что оно применяется после play
  audioRef.current.loop = true;
  
  // Очистка только происходит при размонтировании компонента
  return () => {
    audioRef.current.pause();
  };
}, [isPlaying]); // Убедитесь, что у вас есть isPlaying в массиве зависимостей

const toggleSound = () => {
  setIsPlaying(!isPlaying);
};

  function convertNumberToShortForm(number) {
    let suffixes = 'ambtdefghijklnopqrsuvwxyz'.split('');
    let suffixIndex = -1;
    let processedNumber = number;

  if (processedNumber >= 999999)  {
    while (processedNumber >= 1000) {
      processedNumber /= 1000;
      suffixIndex++;
    }
  } else {
    return(number);
  }
  
    let suffix = suffixIndex === -1 ? '' : suffixes[suffixIndex % suffixes.length];
    // Для суффиксов больше 'z', добавляем дополнительную букву
    let additionalSuffix = Math.floor(suffixIndex / suffixes.length);
    if (additionalSuffix > 0) {
      suffix = String.fromCharCode(96 + additionalSuffix) + suffix;
    }
  
    return processedNumber.toFixed(2) + suffix;
  }
 
  const TotalUpgrade = ({ id, totname, totcost, totOnPurshcase, totPurchcased }) => {

    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handlePurchase = () => {
        // Если покупка успешна, деактивируем кнопку
        if(totOnPurshcase(id, totcost)) {
            setIsButtonDisabled(true);
        }
    };

    return (
        <>
        <div key={id} className="bg-gray-600 p-4 rounded-lg shadow-inner mt-2">
          <h3 className="text-lg">{totname}</h3>
          <p>Стоимость: {totcost} $</p>
          <p>Effect: income x2</p>
          {!totPurchcased && (
            <button
              onClick={handlePurchase}
              disabled={isButtonDisabled}
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mt-3 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              Купить
            </button>
          )}
          {totPurchcased && (
            <button
              disabled={true}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-3 opacity-50 cursor-not-allowed"
            >
              Куплено
            </button>
          )}
        </div>   
        </>
    );
}
 
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  

  const toggleStore = () => {
    if (isLabOpen) setIsLabOpen(false);
    if (isMenuOpen) setIsMenuOpen(false);
    setIsStoreOpen(!isStoreOpen);
  };

  const [firstBusinessMultiplier, setFirstBusinessMultiplier] = useState(() => {
    const savedMultiplier = localStorage.getItem('firstBusinessMultiplier');
    return savedMultiplier ? Number(savedMultiplier) : 1;
  });
  const [secondBusinessMultiplier, setSecondBusinessMultiplier] = useState(() => {
    const savedMultiplier = localStorage.getItem('secondBusinessMultiplier');
    return savedMultiplier ? Number(savedMultiplier) : 1;
  });
  const [thirdBusinessMultiplier, setThirdBusinessMultiplier] = useState(() => {
    const savedMultiplier = localStorage.getItem('thirdBusinessMultiplier');
    return savedMultiplier ? Number(savedMultiplier) : 1;
  });
  const locations = [
    { id: 1, name: 'Desert', cost: 1000 }
    // Добавьте здесь больше локаций по мере необходимости
  ];

  const totalUpgrade = [
    { 
      id: 2, totname: 'First Buisness Upgrade #1', totcost: 100
    },
    {
      id: 3, totname: 'Second Buisness Upgrade #1', totcost: 10000
    },
    {
      id: 4, totname: 'Third Buisness Upgrade #1', totcost: 100000
    },
    { 
      id: 5, totname: 'First Buisness Upgrade #2', totcost: 10000
    },
    {
      id: 6, totname: 'Second Buisness Upgrade #2', totcost: 50000
    },
    {
      id: 7, totname: 'Third Buisness Upgrade #2', totcost: 500000
    },
    
  ]

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [taxes, setTaxes] = useState(() => Number(localStorage.getItem('taxes')) || 0);

// Функция для открытия/закрытия меню
const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

const toggleMenu = (event) => {
  if (isStoreOpen) setIsStoreOpen(false);
  if (isLabOpen) setIsLabOpen(false);
  const rect = event.currentTarget.getBoundingClientRect();
  setMenuPosition({
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX
  });
  setIsMenuOpen(!isMenuOpen);
};

const [creditAmount, setCreditAmount] = useState(() => Number(localStorage.getItem('creditAmount')) || 0);
const [debt, setDebt] = useState(() => Number(localStorage.getItem('debt')) || 0);
const [payment, setPayment] = useState(() => Number(localStorage.getItem('payment')) || 0);

useEffect(() => {
  let interval;
  if (debt > 0) {
    interval = setInterval(() => {
      // Расчет платежа и пени
      const debtPayment = debt * 0.007; // Сумма платежа по долгу
      const penaltyPayment = creditAmount * 0.003; // Сумма пеня

      // Обновление долга
      setDebt((prevDebt) => Math.max(prevDebt - debtPayment, 0));
      
      // Вычет платежа из баланса
      setBalance((currentBalance) => currentBalance - debtPayment - penaltyPayment);

      // Если долг погашен, останавливаем интервал
      if (debt - debtPayment <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }
}, [debt, creditAmount, setBalance]);

const takeCredit = (income) => {

  if (debt > 0) {
    alert('Вы ещё не выплатили предыдущий кредит!');
    return;
  }
  
  const amount = prompt('Введите сумму кредита (максимум 1,000,000):');
  
  // Если пользователь нажал "Отмена" в prompt
  if (amount === null) {
    alert('Ввод отменен.');
    return;
  }

  const credit = parseFloat(amount);
  const maxCredit = Math.min(1000000, income * 200); // Максимум либо 1,000,000, либо в 200 раз больше дохода

  // Проверяем, что введено число и оно не превышает максимально допустимый кредит
  if (!isNaN(credit) && credit > 0 && credit <= maxCredit) {
    setCreditAmount(credit);
    setDebt(credit);
    setPayment(credit * 0.01); // Установка начального ежесекундного платежа
    setBalance(currentBalance => currentBalance + credit); // Начисляем кредит на баланс
  } else if (credit > maxCredit) {
    alert(`Сумма кредита не может превышать ${maxCredit}.`);
  } else {
    alert('Пожалуйста, введите валидную сумму.');
  }
};

// Эффект для начисления налогов
useEffect(() => {
  const handleTaxCalculation = () => {
    setTaxes((currentTaxes) => currentTaxes + income * 0.2);
  };

  // Запустите начисление налогов сразу при монтировании компонента
  handleTaxCalculation();

  // Установите интервал на каждую минуту, а не каждую секунду
  const taxInterval = setInterval(handleTaxCalculation, 1000); // 60000 миллисекунд = 1 минута

  // Очистите интервал при размонтировании компонента
  return () => clearInterval(taxInterval);
}, [income]); // Перезапускаем интервал, если баланс изменился

// Функция для оплаты налогов
const payTaxes = () => {
  setBalance((currentBalance) => {
    if (currentBalance >= taxes) {
      setTaxes(0); // Сбросить налоги после оплаты
      return currentBalance - taxes;
    } else {
      alert("Недостаточно средств для оплаты налогов!");
      return currentBalance; // Возвращаем текущий баланс, если средств недостаточно
    }
  });
};

  const convertBalanceToGreenCrystals = () => {
    const conversionRate = 10000; // Курс обмена
    const newGreenCrystals = balance / conversionRate;
    if (debt > 0) {
      alert ('You cant make convertation until your debt is exist!')
    }
    setGreenCrystals(currentGreenCrystals => currentGreenCrystals + newGreenCrystals);
    setBalance(0); // Обнуляем balance после конвертации
    // Предполагается, что balance полностью конвертируется в greenCrystals
  };

  const purchaseUpgrade = (id, cost) => {
    if (balance >= cost) {
      // Обновляем баланс
      setBalance(currentBalance => {
        const newBalance = currentBalance - cost;
        localStorage.setItem('balance', newBalance.toString());
        return newBalance;
      });
    
      // Обновляем апгрейды
      setPurchasedUpgrade(prev => {
        const updatedUpgrades = { ...prev, [id]: true };
        localStorage.setItem('purchasedUpgrade', JSON.stringify(updatedUpgrades));
        return updatedUpgrades;
      });
      
      // Определите, какой бизнес нужно улучшить на основе id улучшения
      if (id === 2) { // Предполагаем, что id 2 относится к первому бизнесу
        setFirstBusinessMultiplier(prevMultiplier => {
          const newMultiplier = prevMultiplier * 2;
          // Здесь вы также можете сохранить этот новый множитель в localStorage, если это необходимо
          return newMultiplier;
        });
      } else if (id === 3) {
        setSecondBusinessMultiplier(prev => prev * 2);
      } else if (id === 4) {
        setThirdBusinessMultiplier(prev => prev * 2);
      } else if (id === 5) {
        setFirstBusinessMultiplier(prev => prev * 2);
      } else if (id === 6) {
        setSecondBusinessMultiplier(prev => prev * 2);
      } else if (id ===7) {
        setThirdBusinessMultiplier(prev => prev * 2);
      }
    } else {
      alert('Not enough balance to unlock!');
    }
  };

  const purchaseLocation = (id, cost) => {
    // Assuming taxes is a state variable that is updated elsewhere in the application.
    if (greenCrystals >= cost) {
      if (taxes >= 1000000) {
        alert('Your taxes are too high, please pay before purchasing a location!');
        return; // Exit the function early if taxes are too high
      }
      if (debt > 0) {
        alert('Please pay your credit before purchasing a loaction!');
        return;
      }
      setGreenCrystals(currentGreenCrystals => currentGreenCrystals - cost);
      setPurchasedLocations(prevLocations => {
        const updatedLocations = { ...prevLocations, [id]: true };
        localStorage.setItem('purchasedLocations', JSON.stringify(updatedLocations));
        return updatedLocations;
      });
    } else {
      alert('Not enough green crystals to purchase!');
    }
};
  //valuta green crystals
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isResearching, setIsResearching] = useState(false);


  const [researchTimeLeft, setResearchTimeLeft] = useState(60); // Время в секундах
  const [sciencePoints, setSciencePoints] = useState(() => Number(localStorage.getItem('sciencePoints')) || 0);
  //const [isPlaying, setIsPlaying] = useState(false);

  const [purchasedUpgrade, setPurchasedUpgrade] = useState(() => {
    const saved = localStorage.getItem('purchasedUpgrade');
    return saved ? JSON.parse(saved) : {};
  });
  const [greenCrystals, setGreenCrystals] = useState(() => Number(localStorage.getItem('greenCrystals')) || 0);
  const [purchasedLocations, setPurchasedLocations] = useState(() => {
    const savedLocations = localStorage.getItem('purchasedLocations');
    return savedLocations ? JSON.parse(savedLocations) : {};
  });
  //first bussiness
  
  const [upgradeCost, setUpgradeCost] = useState(() => Number(localStorage.getItem('upgradeCost')) || 10);
  const [upgradeCount, setUpgradeCount] = useState(() => Number(localStorage.getItem('upgradeCount')) || 0);

  //second bussiness
  const [secondWindowUnlocked, setSecondWindowUnlocked] = useState(() => Number(localStorage.getItem('secondWindowUnlocked')) || 0);
  const [secondIncome, setSecondIncome] = useState(() => Number(localStorage.getItem('secondIncome')) || 0);
  const [secUpgradeCost, setSecUpgradeCost] = useState(() => Number(localStorage.getItem('secUpgradeCost')) || 100);
  const [secUpgradeCount, setSecUpgradeCount] = useState(() => Number(localStorage.getItem('secUpgradeCount')) || 0);
  
  //third bussiness
  const [thirdWindowUnlocked, setThirdWindowUnlocked] = useState(() => Number(localStorage.getItem('thirdWindowUnlocked')) || 0);
  const [thirdIncome, setThirdIncome] = useState(() => Number(localStorage.getItem('thirdIncome')) || 0);
  const [thirdUpgradeCost, setThirdUpgradeCost] = useState(() => Number(localStorage.getItem('thirdUpgradeCost')) || 10000);
  const [thirdUpgradeCount, setThirdUpgradeCount] = useState(() => Number(localStorage.getItem('thirdUpgradeCount')) || 0);

  const secondUnlockCost = 1000;
  const thirdUnlockCost = 50000;

  useEffect(() => {
    // Сохранение текущего состояния в localStorage
    const saveState = () => {
      localStorage.setItem('researchCost', researchCost.toString());
      localStorage.setItem('creditAmount', creditAmount.toString());
      localStorage.setItem('debt', debt.toString());
      localStorage.setItem('payment', payment.toString());

      localStorage.setItem('sciencePoints', sciencePoints.toString());

      localStorage.setItem('firstBusinessMultiplier', firstBusinessMultiplier.toString());
      localStorage.setItem('secondBusinessMultiplier', secondBusinessMultiplier.toString());
      localStorage.setItem('thirdBusinessMultiplier', thirdBusinessMultiplier.toString());
      localStorage.setItem('purchasedUpgrade', JSON.stringify(purchasedUpgrade));
      localStorage.setItem('taxes', JSON.stringify(taxes));

      localStorage.setItem('purchasedLocations', JSON.stringify(purchasedLocations));
      localStorage.setItem('greenCrystals', greenCrystals.toString());
      //first Window
      localStorage.setItem('balance', balance.toString());
      localStorage.setItem('income', income.toString());
      localStorage.setItem('upgradeCost', upgradeCost.toString());
      localStorage.setItem('upgradeCount', upgradeCount.toString());
      //second Window
      localStorage.setItem('secondWindowUnlocked', secondWindowUnlocked ? '1' : '0');
      localStorage.setItem('secondIncome', secondIncome.toString());
      localStorage.setItem('secUpgradeCost', secUpgradeCost.toString());
      localStorage.setItem('secUpgradeCount', secUpgradeCount.toString());
      //third Window
      localStorage.setItem('thirdWindowUnlocked', thirdWindowUnlocked ? '1' : '0');
      localStorage.setItem('thirdIncome', thirdIncome.toString());
      localStorage.setItem('thirdUpgradeCost', thirdUpgradeCost.toString());
      localStorage.setItem('thirdUpgradeCount', thirdUpgradeCount.toString());
    };

    // Вызов сохранения состояния при изменении любого из состояний
    saveState();
  }, [balance, income, researchCost, upgradeCost, creditAmount, debt, payment, upgradeCount, taxes, secondWindowUnlocked, secondIncome, sciencePoints, secUpgradeCost, secUpgradeCount, thirdWindowUnlocked, thirdIncome, thirdUpgradeCost, thirdUpgradeCount, greenCrystals, purchasedLocations, purchasedUpgrade, secondBusinessMultiplier, firstBusinessMultiplier, thirdBusinessMultiplier]);

    useEffect(() => {
  const interval = setInterval(() => {
    setBalance((currentBalance) => 
      currentBalance +
      income * firstBusinessMultiplier +
      secondIncome * secondBusinessMultiplier +
      thirdIncome * thirdBusinessMultiplier
    );
  }, 1000);
  
  return() => clearInterval(interval);
}, [income, firstBusinessMultiplier, secondIncome, secondBusinessMultiplier, thirdIncome, thirdBusinessMultiplier]);

    const purshcaseUpgrade = () => {
        const isFifthUpgrade = (upgradeCount + 1) % 5 === 0;
        const isTenthUpgrade = (upgradeCount + 1) % 10 === 0;
    
        if (balance >= upgradeCost) {
            // Рассчитываем фактор увеличения дохода в зависимости от номера улучшения
            let baseIncrement = 1.1; // Базовое увеличение на 10%
            let additionalIncrement = (upgradeCount % 5) * 0.02; // Дополнительное увеличение на 2% за каждый уровень в текущем цикле пяти улучшений
            let incrementFactor = baseIncrement + additionalIncrement;
    
            // Увеличиваем доход
            setIncome(currentIncome => currentIncome * incrementFactor);
    
            // Уменьшаем баланс на стоимость улучшения
            setBalance(currentBalance => currentBalance - upgradeCost);
    
            // Увеличиваем счётчик улучшений
            setUpgradeCount(currentCount => currentCount + 1);
    
            // Увеличиваем стоимость следующего улучшения
            let costMultiplier = 1.2 + (isFifthUpgrade ? 0.1 : 0); // Основное увеличение на 20%, дополнительное на 10% каждое пятое улучшение
            setUpgradeCost(currentCost => currentCost * costMultiplier);
    
            if (isFifthUpgrade) {
                if (sciencePoints > 0) {
                    // Дополнительное увеличение дохода на 50% на каждом пятом улучшении
                    setIncome(currentIncome => currentIncome * 1.5);
                    // Уменьшаем количество очков науки
                    setSciencePoints(currentPoints => currentPoints - 1);
                } else {
                    alert("Not enough science points for this upgrade!");
                    // Отменяем последнее улучшение, если не хватает научных очков
                    setIncome(currentIncome => currentIncome / incrementFactor);
                    setBalance(currentBalance => currentBalance + upgradeCost);
                    setUpgradeCount(currentCount => currentCount - 1);
                    setUpgradeCost(currentCost => currentCost / costMultiplier);
                    return;
                }
            }
    
            if (isTenthUpgrade) {
                // Удвоение дохода на каждом десятом улучшении
                setIncome(currentIncome => currentIncome * 2);
            }
    
        } else {
            alert("Not enough balance for this upgrade!");
        }
    };

    const unlockSecondWindow = () => {
      
      if (balance >= secondUnlockCost && !secondWindowUnlocked) {
        
      setBalance(prevBalance => prevBalance - secondUnlockCost);
       setSecondWindowUnlocked(true);
       localStorage.setItem('secondWindowUnlocked', '1');
      } else {
        alert("Not enough balance to unlock!");
      }
    };

    const unlockThirdWindow = () => {
      if (balance >= thirdUnlockCost && !thirdWindowUnlocked) {
        setBalance(prevBalance => prevBalance - thirdUnlockCost);
        setThirdWindowUnlocked(true);
        localStorage.setItem('thirdWindowUnlocked', '1');
      } else {
        alert('Not enough balance to unlock!');
      }
    };
     
    const secPurshcaseUpgrade = () => {
      const isFifthUpgrade = (secUpgradeCount + 1) % 5 === 0;
      const isTenthUpgrade = (secUpgradeCount + 1) % 10 === 0;

      if (balance >= secUpgradeCost && (!isFifthUpgrade || (isFifthUpgrade && sciencePoints > 0))) {
        let baseSecIncrement = 1.3; // Базовое увеличение на 10%
            let additionalSecIncrement = (secUpgradeCount % 5) * 0.02; // Дополнительное увеличение на 2% за каждый уровень в текущем цикле пяти улучшений
            let incrementSecFactor = baseSecIncrement + additionalSecIncrement;

        setSecondIncome(currentsecondIncome => currentsecondIncome * incrementSecFactor + 10)
        setBalance(prevBalance => prevBalance - secUpgradeCost);
        setSecUpgradeCount(secUpgradeCount + 1);

        let costSecMultiplier = 1.2 + (isFifthUpgrade ? 0.1 : 0); // Основное увеличение на 20%, дополнительное на 10% каждое пятое улучшение
            setSecUpgradeCost(currentsecCost => currentsecCost * costSecMultiplier);
            

        if (isFifthUpgrade) {
          if (sciencePoints > 0) {
          // Если это пятое улучшение, уменьшаем количество очков науки
          setSciencePoints(currentPoints => currentPoints - 1);
          setSecondIncome(currentsecondIncome => currentsecondIncome * 1.7); // Дополнительное увеличение дохода
        } else {
          alert("Not enough science points for this upgrade!");
                    // Отменяем последнее улучшение, если не хватает научных очков
                    setSecondIncome(currentsecondIncome => currentsecondIncome / incrementSecFactor);
                    setBalance(currentBalance => currentBalance + secUpgradeCost);
                    setSecUpgradeCount(currentsecUpgradeCount => currentsecUpgradeCount - 1);
                    setSecUpgradeCost(currentsecCost => currentsecCost / costSecMultiplier);
                    return;
        }
      }

        if (isTenthUpgrade) {
          // Удвоение дохода на каждом десятом улучшении
          setSecondIncome(currentsecondIncome => currentsecondIncome * 1.8);
      }
    } else {
      alert("Not enough balance for this upgrade!");
    }
  };

  const thirdPurshcaseUpgrade = () => {

      const isFifthUpgrade = (thirdUpgradeCount + 1) % 5 === 0;
      const isTenthUpgrade = (thirdUpgradeCount + 1) % 10 === 0;

      if (balance >= thirdUpgradeCost && (!isFifthUpgrade || (isFifthUpgrade && sciencePoints > 0))) {
        let baseThirdIncrement = 1.3; // Базовое увеличение на 10%
            let additionalThirdIncrement = (thirdUpgradeCount % 5) * 0.02; // Дополнительное увеличение на 2% за каждый уровень в текущем цикле пяти улучшений
            let incrementThirdFactor = baseThirdIncrement + additionalThirdIncrement;

        setThirdIncome(currentthirdIncome => currentthirdIncome * incrementThirdFactor + 100)
        setBalance(prevBalance => prevBalance - thirdUpgradeCost);
        setThirdUpgradeCount(thirdUpgradeCount + 1);

        let costThirdMultiplier = 1.5 + (isFifthUpgrade ? 0.2 : 0); // Основное увеличение на 20%, дополнительное на 10% каждое пятое улучшение
            setThirdUpgradeCost(currentthirdCost => currentthirdCost * costThirdMultiplier);
            

        if (isFifthUpgrade) {
          if (sciencePoints > 0) {
          // Если это пятое улучшение, уменьшаем количество очков науки
          setSciencePoints(currentPoints => currentPoints - 1);
          setThirdIncome(currentthirdIncome => currentthirdIncome * 2); // Дополнительное увеличение дохода
        } else {
          alert("Not enough science points for this upgrade!");
                    // Отменяем последнее улучшение, если не хватает научных очков
                    setThirdIncome(currentthirdIncome => currentthirdIncome / incrementThirdFactor);
                    setBalance(currentBalance => currentBalance + thirdUpgradeCost);
                    setThirdUpgradeCount(currentthirdUpgradeCount => currentthirdUpgradeCount - 1);
                    setThirdUpgradeCost(currentthirdCost => currentthirdCost / costThirdMultiplier);
                    return;
        }
      }

        if (isTenthUpgrade) {
          // Удвоение дохода на каждом десятом улучшении
          setThirdIncome(currentthirdIncome => currentthirdIncome * 2);
      }
    } else {
      alert("Not enough balance for this upgrade!");
    }
  }

    return (
      <>
      <div style={{ backgroundImage: `url(${backgroundImage})` }} className=" relative min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center">

      <div className="absolute top-0 left-0 m-4 z-50">
  <button className="p-2" onClick={toggleMenu}>
    {/* Иконка гамбургера */}
    <img
      src={menuIcon} // Путь к иконке гамбургера
      alt="Menu"
      className="h-9 w-9"
    />
  </button>
</div>

{/* Контейнер для кнопок 'Магазин', 'Лаборатория', и звука */}
<div className="absolute top-0 right-0 m-4 flex items-center space-x-2 z-50">
  <button onClick={toggleStore} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
    Магазин
  </button>
  <button onClick={toggleLab} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Лаборатория
  </button>
  <button onClick={toggleSound} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-bold text-2xl border-2 border-green-500">
    {isPlaying ? '🔊' : '🔇'}
  </button>
</div>
        
        
{isLabOpen && (
    <div className="absolute right-0 mt-5 top-14 mr-4 bg-gray-700 p-5 rounded-lg shadow-lg" style={{ zIndex: 100, maxHeight: '500px', overflowY: 'auto', width: '400px', backgroundImage: `url(${backgroundImage})` }}>
      <h2 className="text-xl mb-2">Лаборатория</h2>
      <p className='mb-2'>{sciencePoints}🧪</p>
      <button
        onClick={startResearch}
        disabled={isResearching}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {isResearching ? `Идет исследование ${researchTimeLeft.toFixed(0)} сек` : `Начать исследование за $${researchCost}`}
      </button>
    </div>
  )}

  {isMenuOpen && (
  <div className="absolute z-10 p-5 bg-gray-600 rounded shadow-lg ml-2" style={{ width: `300px`, top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, backgroundImage: `url(${backgroundImageRev})`}} >
    <h2 className="text-xl mb-2 mt-2">Меню</h2>
      <div className="bg-gray-600 p-3 rounded shadow-xl">
        <p>Налоги: ${taxes.toFixed(2)}</p>
        <button
          className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded my-2"
          onClick={payTaxes}
        >
          Оплатить налоги
        </button>
        {/* ...Контент для раздела Имущество... */}
      </div>
      <button
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded my-2"
          onClick={() => takeCredit(income)}
        >
          Взять кредит
        </button>
        {debt > 0 && (
          <div className="text-red-500">
            <p>Долг: ${debt.toFixed(2)}</p>
            <p>Платеж: ${payment.toFixed(2)} / сек</p>
          </div>
        )}
     <div className='flex justify-center'>
      <RundomButton setBalance={setBalance} income={income} firstBusinessMultiplier={firstBusinessMultiplier} />
</div>
      <div className="flex justify-center mt-3">
      <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={toggleMenu}
        >
          Закрыть
        </button>
        </div>
    </div>
  )}

{isStoreOpen && (
  <div style={{zIndex: 100, maxHeight: '500px', overflowY: 'auto', width: '400px', backgroundImage: `url(${backgroundImage})`}}className="bg-gray-700 p-5 rounded-lg shadow-lg mt-5 absolute right-0 top-14 mr-4">
  <h2 className="text-xl mb-4">Магазин локаций</h2>
  <div className="flex items-center mb-4">
  <img src={greenCrystal} alt="Green Crystal" className="inline-block h-6 w-6" /> <span className="font-bold">{greenCrystals.toFixed(4)}</span>
  </div>
  <button onClick={convertBalanceToGreenCrystals} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-110 mb-4">
    Конвертировать баланс в <img src={greenCrystal} alt="Green Crystal" className="inline-block h-6 w-6" />
  </button>
    {locations.map(location => (
        <Location
          key={location.id}
          id={location.id}
          name={location.name}
          cost={location.cost}
          purchased={!!purchasedLocations[location.id]}
          onPurchase={purchaseLocation}
        />
      ))}

<div className="mt-8 mb-4">
      <h2 className="text-xl font-bold">Upgrades</h2>
    </div>

    {totalUpgrade.map(totalUpgradeItem => (
  <TotalUpgrade
  key={totalUpgradeItem.id}
  id={totalUpgradeItem.id}
  totname={totalUpgradeItem.totname}
  totcost={totalUpgradeItem.totcost}
  totPurchcased={!!purchasedUpgrade[totalUpgradeItem.id]}
  totOnPurshcase={purchaseUpgrade}
/>
  
  ))}

    </div>
)}
      <button onClick={resetGame} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-110">Start Over</button>
      <h1 className="text-4xl font-bold mb-6">Business Game</h1>
      <p className="text-xl mb-2">Balance: <span className="font-bold">${convertNumberToShortForm(balance.toFixed(2))}</span></p>
      <div className="flex flex-wrap justify-center gap-4">
        <BusinessWindow
          name="First Bussiness"
          income={income}
          onUpgrade={purshcaseUpgrade}
          upgradeCost={upgradeCost}
          level={upgradeCount}
          unlocked={true}
          multiplier={firstBusinessMultiplier}
          convertNumberToShortForm={convertNumberToShortForm}
        />
        <BusinessWindow
          name="Second Bussiness"
          income={secondIncome}
          onUpgrade={secPurshcaseUpgrade}
          upgradeCost={secUpgradeCost}
          level={secUpgradeCount}
          unlocked={secondWindowUnlocked}
          onUnlock={unlockSecondWindow}
          unlockCost={secondUnlockCost}
          multiplier={secondBusinessMultiplier}
          convertNumberToShortForm={convertNumberToShortForm}
        />
          <BusinessWindow
          name="Third Bussiness"
          income={thirdIncome}
          onUpgrade={thirdPurshcaseUpgrade}
          upgradeCost={thirdUpgradeCost}
          level={thirdUpgradeCount}
          unlocked={thirdWindowUnlocked}
          onUnlock={unlockThirdWindow}
          unlockCost={thirdUnlockCost}
          multiplier={thirdBusinessMultiplier}
          convertNumberToShortForm={convertNumberToShortForm}
        />
        
      </div>
    </div>
    
    </>
  );
};
export default BuisnessGame;
