from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import CommunityPost, User
from app.schemas import CommunityPostCreate, CommunityPostResponse

router = APIRouter(prefix="/community", tags=["Peer Community Hub"])

@router.get("/posts", response_model=List[CommunityPostResponse])
def get_community_posts(
    topic_circle: Optional[str] = Query(None, description="Filter by topic circle"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Retrieve community posts across topic circles (Athletic Amenorrhea & REDs, PCOS, Maternal, etc.).
    Supports anonymous author masking.
    """
    query = db.query(CommunityPost)
    if topic_circle and topic_circle.lower() != "all":
        query = query.filter(CommunityPost.topic_circle.ilike(f"%{topic_circle}%"))
    
    posts = query.order_by(CommunityPost.upvotes.desc(), CommunityPost.created_at.desc()).limit(limit).all()
    
    return [
        CommunityPostResponse(
            post_id=p.post_id,
            user_id=p.user_id if not p.is_anonymous else "anonymous",
            author_display_name="Anonymous Athlete" if p.is_anonymous else p.author_display_name,
            is_anonymous=p.is_anonymous,
            topic_circle=p.topic_circle,
            title=p.title,
            content=p.content,
            upvotes=p.upvotes,
            created_at=p.created_at
        ) for p in posts
    ]

@router.post("/posts", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
def create_community_post(payload: CommunityPostCreate, db: Session = Depends(get_db)):
    """
    Publish a post or question in the Community Hub.
    Users can toggle anonymous posting to protect sensitive health details.
    """
    user = db.query(User).filter(User.user_id == payload.user_id).first()
    display_name = "Anonymous Athlete"
    if not payload.is_anonymous and user:
        display_name = payload.author_display_name or user.full_name
    elif not payload.is_anonymous:
        display_name = payload.author_display_name or "Athlete Member"

    new_post = CommunityPost(
        user_id=payload.user_id,
        author_display_name=display_name,
        is_anonymous=payload.is_anonymous,
        topic_circle=payload.topic_circle,
        title=payload.title,
        content=payload.content,
        upvotes=1  # Author upvote
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return CommunityPostResponse(
        post_id=new_post.post_id,
        user_id=new_post.user_id if not new_post.is_anonymous else "anonymous",
        author_display_name=new_post.author_display_name,
        is_anonymous=new_post.is_anonymous,
        topic_circle=new_post.topic_circle,
        title=new_post.title,
        content=new_post.content,
        upvotes=new_post.upvotes,
        created_at=new_post.created_at
    )

@router.post("/posts/{post_id}/upvote")
def upvote_post(post_id: str, db: Session = Depends(get_db)):
    """Increment upvote counter for helpful recovery advice or peer answers."""
    post = db.query(CommunityPost).filter(CommunityPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Community post not found")
    
    post.upvotes += 1
    db.commit()
    db.refresh(post)
    return {"status": "success", "post_id": post_id, "upvotes": post.upvotes}
