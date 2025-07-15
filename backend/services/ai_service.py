"""
AI Service for Quiz Generation
Based on the original NCC ABYAS system's sophisticated AI integration
"""
import os
import re
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import google.generativeai as genai
from app_models import QuizQuestion

# Configuration constants (from original system)
TEMP_QUIZ = 0.5
MAX_TOKENS_QUIZ = 2500
MODEL_NAME = 'gemini-1.5-flash'

class AIQuizService:
    def __init__(self):
        self.model = None
        self.model_error = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize Gemini AI model"""
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your_api_key_here":
                self.model_error = "GEMINI_API_KEY environment variable not set"
                return
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(MODEL_NAME)
            self.model_error = None
            
        except Exception as e:
            self.model_error = f"Failed to initialize Gemini model: {str(e)}"
    
    def generate_quiz_questions(
        self, 
        topic: str, 
        difficulty: str, 
        num_questions: int,
        is_custom: bool = False
    ) -> Tuple[List[QuizQuestion], Optional[str]]:
        """
        Generate quiz questions using AI
        Returns (questions_list, error_message)
        """
        if self.model_error or not self.model:
            return [], f"Model error: {self.model_error}"
        
        try:
            prompt = self._build_quiz_prompt(topic, num_questions, difficulty)
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=TEMP_QUIZ,
                    max_output_tokens=MAX_TOKENS_QUIZ
                )
            )
            
            raw_response_text = response.text
            parsed_questions = self._parse_ai_quiz_response(raw_response_text)
            
            if parsed_questions:
                # Convert to QuizQuestion objects
                quiz_questions = []
                for i, q_data in enumerate(parsed_questions):
                    question = QuizQuestion(
                        id=f"{topic.lower().replace(' ', '_')}_{i+1}",
                        question=q_data["question"],
                        options=q_data["options"],
                        answer=q_data["answer"],
                        explanation=q_data["explanation"],
                        topic=topic,
                        difficulty=difficulty,
                        created_at=datetime.now().isoformat()
                    )
                    quiz_questions.append(question)
                
                return quiz_questions, None
            else:
                return [], "Failed to parse valid quiz questions from AI response"
                
        except Exception as e:
            return [], f"Error generating quiz: {str(e)}"
    
    def _build_quiz_prompt(self, topic: str, num_q: int, difficulty: str) -> str:
        """
        Build enhanced Gemini prompt for quiz generation
        Based on original system's sophisticated prompt engineering
        """
        difficulty_instructions = {
            "Easy": "focus on basic concepts, definitions, and straightforward facts. Questions should be simple to understand.",
            "Medium": "require understanding of intermediate concepts, some application of knowledge, and ability to differentiate between related ideas. Distractors should be plausible.",
            "Hard": "demand advanced understanding, critical thinking, analysis, or synthesis of information. Questions can be multi-step or scenario-based. Distractors should be very subtle."
        }
        
        prompt = f"""
You are an expert NCC (National Cadet Corps) instructor. Your task is to generate {num_q} high-quality multiple-choice questions (MCQs) about the NCC topic: "{topic}".
The target audience is NCC cadets.
The desired difficulty level is: {difficulty.upper()}. For this difficulty, {difficulty_instructions.get(difficulty, difficulty_instructions['Medium'])}

For each question, strictly adhere to the following format:

Q: [Your question text here. Ensure it is clear, unambiguous, and relevant to NCC.]
A) [Option A - Plausible, but incorrect if not the answer]
B) [Option B - Plausible, but incorrect if not the answer]
C) [Option C - Plausible, but incorrect if not the answer]
D) [Option D - Plausible, but incorrect if not the answer]
ANSWER: [A single uppercase letter: A, B, C, or D corresponding to the correct option]
EXPLANATION: [A concise but comprehensive explanation. Clarify why the correct answer is right and, if applicable, why common misconceptions (represented by distractors) are wrong. This should aid learning.]

---
[This '---' separator MUST be on its own line between each complete question block]

Important Guidelines:
1. Number of Questions: Generate exactly {num_q} questions.
2. Format Adherence: The specified format (Q:, A), B), C), D), ANSWER:, EXPLANATION:, ---) is CRITICAL for parsing. Do not deviate.
3. Options: Provide exactly four unique options (A, B, C, D). Avoid "All of the above" or "None of the above". Distractors should be relevant to the topic.
4. Answer: Clearly indicate the single correct answer using the format "ANSWER: [Letter]".
5. Explanation: The explanation is crucial for learning. Make it informative.
6. Relevance: All questions, options, and explanations must be directly related to NCC.
7. Clarity: Ensure questions are well-phrased and easy to understand for NCC cadets.
8. Originality: Generate fresh questions, not just copied from standard texts if possible, while staying true to NCC doctrine.
"""
        return prompt
    
    def _parse_ai_quiz_response(self, response_text: str) -> List[Dict[str, Any]]:
        """
        Parse raw quiz response from AI into structured format
        Enhanced for robustness, whitespace tolerance, and better error logging
        """
        parsed_questions = []
        question_blocks = re.split(r"\n\s*-{3,}\s*\n", response_text.strip())
        q_re = re.compile(r'Q:\s*(.*)', re.IGNORECASE)
        opt_re = re.compile(r'([A-D])\)\s*(.*)')
        ans_re = re.compile(r'ANSWER:\s*([A-D])', re.IGNORECASE)
        exp_re = re.compile(r'EXPLANATION:\s*(.*)', re.IGNORECASE | re.DOTALL)

        for idx, block in enumerate(question_blocks):
            block = block.strip()
            if not block:
                continue
            question_data = {
                "question": "",
                "options": {},
                "answer": "",
                "explanation": ""
            }
            # Extract question
            q_match = q_re.search(block)
            if q_match:
                question_data["question"] = q_match.group(1).strip()
            else:
                print(f"[AIQuizService] Block {idx+1}: Failed to find question line. Block: {block[:80]}...")
            # Extract options
            current_options_text = block[q_match.end():] if q_match else block
            for opt_match in opt_re.finditer(current_options_text):
                option_key = opt_match.group(1)
                option_text = opt_match.group(2).strip()
                # Remove trailing 'ANSWER:' or 'EXPLANATION:' if AI merged lines
                option_text = re.split(r'(ANSWER:|EXPLANATION:)', option_text)[0].strip()
                question_data["options"][option_key] = option_text
            # Extract answer
            ans_match = ans_re.search(block)
            if ans_match:
                question_data["answer"] = ans_match.group(1).upper()
            else:
                print(f"[AIQuizService] Block {idx+1}: Failed to find answer line. Block: {block[:80]}...")
            # Extract explanation
            exp_match = exp_re.search(block)
            if exp_match:
                explanation = exp_match.group(1).strip()
                # Remove any trailing option lines if AI hallucinated them
                explanation = re.split(r'^[A-D]\)', explanation, maxsplit=1, flags=re.MULTILINE)[0].strip()
                question_data["explanation"] = explanation
            else:
                print(f"[AIQuizService] Block {idx+1}: Failed to find explanation line. Block: {block[:80]}...")
            # Validate extracted data
            if (question_data["question"] and
                len(question_data["options"]) == 4 and
                question_data["answer"] in question_data["options"] and
                question_data["explanation"]):
                question_data["timestamp"] = datetime.now().isoformat()
                parsed_questions.append(question_data)
            else:
                print(f"[AIQuizService] Block {idx+1}: Incomplete question data. Parsed: {question_data}")
        return parsed_questions
    
    def generate_quiz_from_content(
        self, 
        content: str, 
        topic: str, 
        difficulty: str, 
        num_questions: int
    ) -> Tuple[List[QuizQuestion], Optional[str]]:
        """
        Generate quiz questions from user-provided content
        Returns (questions_list, error_message)
        """
        if self.model_error or not self.model:
            return [], f"Model error: {self.model_error}"
        
        try:
            # Create specialized prompt for content-based questions
            prompt = self._create_content_quiz_prompt(content, topic, difficulty, num_questions)
            
            # Generate response using Gemini
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=TEMP_QUIZ,
                    max_output_tokens=MAX_TOKENS_QUIZ
                )
            )
            
            if not response or not response.text:
                return [], "Failed to generate response from AI model"
            
            # Parse the response into structured questions
            questions_data = self._parse_ai_quiz_response(response.text)
            
            if not questions_data:
                return [], "Failed to parse quiz questions from AI response"
            
            # Convert to QuizQuestion objects
            quiz_questions = []
            for i, q_data in enumerate(questions_data):
                question = QuizQuestion(
                    id=f"q_{i+1}_{datetime.now().timestamp()}",
                    question=q_data['question'],
                    options=q_data['options'],
                    answer=q_data['answer'],
                    explanation=q_data.get('explanation', ''),
                    topic=topic,
                    difficulty=difficulty,
                    created_at=datetime.now().isoformat()
                )
                quiz_questions.append(question)
            
            return quiz_questions, None
            
        except Exception as e:
            error_msg = f"Error generating content-based quiz: {str(e)}"
            print(error_msg)
            return [], error_msg

    def _create_content_quiz_prompt(self, content: str, topic: str, difficulty: str, num_questions: int) -> str:
        """Create specialized prompt for content-based quiz generation"""
        
        # Truncate content if too long (to fit within token limits)
        max_content_length = 8000  # Adjust based on model limits
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."
        
        difficulty_instructions = {
            'Easy': 'Focus on basic facts, definitions, and direct recall from the content.',
            'Medium': 'Include some analysis and application of concepts from the content.',
            'Hard': 'Emphasize critical thinking, synthesis, and deeper understanding of the content.'
        }
        
        prompt = f"""
You are an expert quiz generator. Your task is to create {num_questions} high-quality multiple-choice questions based on the following content.

CONTENT TO ANALYZE:
{content}

INSTRUCTIONS:
- Topic: {topic}
- Difficulty: {difficulty} - {difficulty_instructions.get(difficulty, '')}
- Generate exactly {num_questions} questions
- Questions should be directly based on the provided content
- Avoid questions that require knowledge not present in the content

For each question, use this EXACT format:

Q: [Your question based on the content]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
ANSWER: [Single letter: A, B, C, or D]
EXPLANATION: [Clear explanation referencing the content]

---
[Separator between questions]

Important Guidelines:
1. Base ALL questions on the provided content
2. Make sure each question tests understanding of the material
3. Create plausible but incorrect distractors
4. Explanations should reference specific parts of the content
5. Questions should be appropriate for the {difficulty} difficulty level
6. Use the exact format shown above for proper parsing
"""
        return prompt

# Global service instance
ai_quiz_service = AIQuizService()

def get_ai_quiz_service() -> AIQuizService:
    """Dependency injection for FastAPI"""
    return ai_quiz_service
