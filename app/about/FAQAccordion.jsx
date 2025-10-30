'use client';

import { useState } from 'react';

export default function FAQAccordion({ questions }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleQuestion(index);
    }
  };

  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <article
          key={index}
          className="bg-gray-50 rounded-lg shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleQuestion(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h3 className="text-xl font-bold text-gray-900 pr-8">
              {item.question}
            </h3>
            <span
              className={`text-3xl text-green-600 transform transition-transform flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              ↓
            </span>
          </button>

          <div
            id={`faq-answer-${index}`}
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
          >
            <div className="p-6 pt-0 text-gray-700 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
