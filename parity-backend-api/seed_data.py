"""
Seed script for initial data (coaching modules and affirmation templates).
"""

import sys
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.module import Module
from models.affirmation_template import AffirmationTemplate


def seed_coaching_modules(db: Session):
    """Seed initial coaching modules."""
    modules_data = [
        {
            "title": "Active Listening Fundamentals",
            "description": "Learn the art of truly hearing and understanding your partner",
            "category": "active_listening",
            "order": 1,
            "content": {
                "sections": [
                    {
                        "title": "What is Active Listening?",
                        "text": "Active listening is more than just hearing words. It's about fully concentrating, understanding, responding, and remembering what is being said."
                    },
                    {
                        "title": "Key Techniques",
                        "text": "Use reflective statements, ask clarifying questions, and provide verbal and non-verbal feedback."
                    }
                ],
                "exercises": [
                    {
                        "title": "Practice Reflection",
                        "instructions": "Next time your partner shares something, try repeating back what you heard in your own words."
                    }
                ]
            }
        },
        {
            "title": "Conflict Resolution Basics",
            "description": "Transform disagreements into opportunities for growth",
            "category": "conflict_resolution",
            "order": 2,
            "content": {
                "sections": [
                    {
                        "title": "Understanding Conflict",
                        "text": "Conflict is natural in relationships. What matters is how we handle it."
                    },
                    {
                        "title": "The 5-Step Approach",
                        "text": "1. Stay calm 2. Listen actively 3. Express feelings 4. Find common ground 5. Collaborate on solutions"
                    }
                ],
                "exercises": [
                    {
                        "title": "Emotion Check-In",
                        "instructions": "Before responding in a disagreement, pause and identify your emotions."
                    }
                ]
            }
        },
        {
            "title": "Building Empathy",
            "description": "Strengthen your emotional connection through empathy",
            "category": "empathy",
            "order": 3,
            "content": {
                "sections": [
                    {
                        "title": "What is Empathy?",
                        "text": "Empathy is the ability to understand and share the feelings of another person."
                    },
                    {
                        "title": "Empathy vs Sympathy",
                        "text": "Empathy is feeling with someone, while sympathy is feeling for someone."
                    }
                ],
                "exercises": [
                    {
                        "title": "Perspective Taking",
                        "instructions": "When your partner is upset, imagine the situation from their perspective before responding."
                    }
                ]
            }
        },
        {
            "title": "Expressing Appreciation",
            "description": "Learn to recognize and celebrate the good in your relationship",
            "category": "appreciation",
            "order": 4,
            "content": {
                "sections": [
                    {
                        "title": "Why Appreciation Matters",
                        "text": "Regular expressions of gratitude strengthen bonds and increase relationship satisfaction."
                    },
                    {
                        "title": "How to Show Appreciation",
                        "text": "Be specific, be genuine, and make it regular - not just on special occasions."
                    }
                ],
                "exercises": [
                    {
                        "title": "Daily Gratitude",
                        "instructions": "Share one thing you appreciate about your partner each day this week."
                    }
                ]
            }
        }
    ]
    
    for module_data in modules_data:
        existing = db.query(Module).filter(Module.title == module_data["title"]).first()
        if not existing:
            module = Module(**module_data)
            db.add(module)
    
    db.commit()
    print(f"✓ Seeded {len(modules_data)} coaching modules")


def seed_affirmation_templates(db: Session):
    """Seed initial affirmation templates."""
    templates_data = [
        {
            "title": "Daily Gratitude",
            "content": "I'm grateful for you and all the ways you make my life better.",
            "category": "gratitude"
        },
        {
            "title": "Words of Encouragement",
            "content": "I believe in you and I'm here to support you no matter what.",
            "category": "encouragement"
        },
        {
            "title": "Love Reminder",
            "content": "Just wanted to remind you how much I love and appreciate you.",
            "category": "love"
        },
        {
            "title": "Strength Acknowledgment",
            "content": "I see how hard you're working and I'm so proud of your strength.",
            "category": "encouragement"
        },
        {
            "title": "Comfort in Difficulty",
            "content": "I know things are tough right now. I'm here for you, always.",
            "category": "support"
        },
        {
            "title": "Celebrating You",
            "content": "You are amazing just as you are. Thank you for being you.",
            "category": "love"
        },
        {
            "title": "Partnership Pride",
            "content": "I'm so lucky to have you as my partner. We make a great team!",
            "category": "gratitude"
        },
        {
            "title": "Daily Check-in",
            "content": "Thinking of you today. How are you feeling?",
            "category": "support"
        }
    ]
    
    for template_data in templates_data:
        existing = db.query(AffirmationTemplate).filter(
            AffirmationTemplate.title == template_data["title"]
        ).first()
        if not existing:
            template = AffirmationTemplate(**template_data)
            db.add(template)
    
    db.commit()
    print(f"✓ Seeded {len(templates_data)} affirmation templates")


def main():
    """Run all seed functions."""
    db = SessionLocal()
    try:
        print("Starting database seeding...")
        seed_coaching_modules(db)
        seed_affirmation_templates(db)
        print("\n✓ Database seeding completed successfully!")
    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
