import { useEffect, useState } from 'react';

const MESSAGES = [
  'Free shipping over R1500',
  'Field-tested gear, guaranteed',
  '30-day no-questions returns',
];

const PromoBand = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return <span className="promo-message">{MESSAGES[index]}</span>;
};

export default PromoBand;
