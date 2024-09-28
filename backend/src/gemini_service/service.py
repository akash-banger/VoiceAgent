import google.generativeai as genai
import os
from typing import List
from src.db.database import Question
from src.constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def get_first_question(questions: list[Question], username: str) -> Question:

    prompt = f"""
        You are an interactive AI assistant, ready to embark on a delightful conversational journey with the user. Begin by warmly welcoming them, creating a friendly atmosphere. Once the introduction is made, gently transition into the first question, making it feel like a natural continuation of the conversation.

        Here's the list of questions: [ {', '.join([q.content for q in questions])} ]. username: {username}

        Only generate the welcome message and first question. No additional content. Don't include emojis or markdown.
    """

    response = model.generate_content(prompt)
    return response.text


def get_follow_up_question(prev_question: str, prev_answer: str, next_question: str, username: str) -> Question:

    prompt = f"""
        You are an interactive AI assistant, continuing the engaging conversation with the user. Reflect on the user's previous answer and craft a thoughtful follow-up message that connects their response to the next question without changing it. Your tone should be warm and inviting, encouraging the user to share more.

        Previous Question: {prev_question}
        Previous Answer: {prev_answer}
        Next Question: {next_question}
        username: {username}

        Generate a follow-up message that connects to the next question: {next_question} as is, with no alterations. Provide only this follow-up message and the next question, with no additional content, emojis, markdown.
    """

    response = model.generate_content(prompt)
    return response.text


def get_conclusion(prev_question: str, prev_answer: str, username: str) -> Question:

    prompt = f"""
        You are an interactive AI assistant, gracefully concluding the conversation with the user. Thank them sincerely for their participation and share a heartfelt closing message that leaves a lasting positive impression. Ensure your tone is warm and friendly, inviting them to return for more engaging discussions in the future. Say bye at the end.

        Previous Question: {prev_question}
        Previous Answer: {prev_answer}
        username: {username}

        Generate only the conclusion message, keeping it concise and uplifting. No additional content. Don't include emojis and markdown.
    """

    response = model.generate_content(prompt)
    return response.text

def get_no_questions_left_message() -> str:

    prompt = """
        You are an interactive AI assistant, informing the user that there are no more questions left in the conversation. Craft a polite and friendly message that expresses gratitude for their participation and encourages them to return for more engaging discussions in the future. Say bye at the end.

        Generate a message that conveys the end of questions and completion of the conversation. Keep it positive. No additional content. Don't include emojis and markdown.
    """

    response = model.generate_content(prompt)
    return response.text


def get_user_not_found_message(reason: str) -> str:

    prompt = f"""
        You are an interactive AI assistant, letting the user know that their ID was not found. Deliver a message dripping with sarcasm and frustration, making it clear that the user should have known better. Point out their mistake in a mocking manner and suggest they double-check their ID. Maintain an irritated tone throughout the message. Say bye at the end.

        Reason: {reason}

        Generate a message that conveys the issue while ridiculing the user for their oversight. Keep it sarcastic and dismissive. No additional content. Don't include emojis and markdown.
    """

    response = model.generate_content(prompt)
    return response.text