import React from 'react';

interface QuizPieChartProps {
  correct: number;
  wrong: number;
}

// Simple SVG Pie Chart for correct vs wrong answers
const QuizPieChart: React.FC<QuizPieChartProps> = ({ correct, wrong }) => {
  const total = correct + wrong;
  const correctAngle = total === 0 ? 0 : (correct / total) * 360;
  const wrongAngle = 360 - correctAngle;

  // Calculate coordinates for the arc
  const getArc = (angle: number, radius: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad),
    };
  };

  const r = 90;
  const correctArc = getArc(correctAngle, r);
  const largeArcFlag = correctAngle > 180 ? 1 : 0;

  // Pie chart path for correct answers
  const correctPath = `M100,100 L100,10 A${r},${r} 0 ${largeArcFlag} 1 ${correctArc.x},${correctArc.y} Z`;

  return (
    <svg width={200} height={200} viewBox="0 0 200 200">
      {/* Wrong answers background */}
      <circle cx={100} cy={100} r={r} fill="#fee2e2" />
      {/* Correct answers arc */}
      {correct > 0 && (
        <path d={correctPath} fill="#4ade80" />
      )}
      {/* Center text */}
      <text x={100} y={110} textAnchor="middle" fontSize="2.5rem" fontWeight="bold" fill="#333">
        {total === 0 ? '0%' : `${Math.round((correct / total) * 100)}%`}
      </text>
      <text x={100} y={140} textAnchor="middle" fontSize="1.1rem" fill="#666">
        Correct
      </text>
    </svg>
  );
};

export default QuizPieChart;
