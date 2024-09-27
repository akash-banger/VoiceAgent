from sqlalchemy.exc import SQLAlchemyError
from .database import get_session, User, Question, Answer
from uuid import UUID

def create_user(username: str) -> User:
    session = get_session()
    try:
        new_user = User(username=username)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)  # Refresh the object to ensure all fields are populated
        return new_user
    except SQLAlchemyError as e:
        session.rollback()
        raise e
    finally:
        session.close()

def get_user_by_id(id: UUID) -> User:
    session = get_session()
    try:
        user = session.query(User).filter(User.id == id).first()
        return user
    except SQLAlchemyError as e:
        raise e
    finally:
        session.close()
    
def get_user_by_username(username: str) -> User:
    session = get_session()
    try:
        user = session.query(User).filter(User.username == username).first()
        return user
    except SQLAlchemyError as e:
        raise e
    finally:
        session.close()

def get_questions() -> list[Question]:
    session = get_session()
    try:
        questions = session.query(Question).all()
        return questions
    except SQLAlchemyError as e:
        raise e
    finally:
        session.close()

def create_or_update_answer(user_id: UUID, question_id: UUID, answer_content: str) -> Answer:
    session = get_session()
    try:
        existing_answer = session.query(Answer).filter(
            Answer.user_id == user_id,
            Answer.question_id == question_id
        ).first()

        if existing_answer:
            existing_answer.answer_content = answer_content
            session.commit()
            session.refresh(existing_answer)
            return existing_answer
        else:
            new_answer = Answer(user_id=user_id, question_id=question_id, answer_content=answer_content)
            session.add(new_answer)
            session.refresh(new_answer)
            session.commit()
            return new_answer
    except SQLAlchemyError as e:
        session.rollback()
        raise e
    finally:
        session.close()


def get_answered_questions_by_user(user_id: UUID) -> list[Question]:
    session = get_session()
    try:
        answered_questions = session.query(Question).join(Answer, Question.id == Answer.question_id).filter(Answer.user_id == user_id).all()
        return answered_questions
    except SQLAlchemyError as e:
        raise e
    finally:
        session.close()



