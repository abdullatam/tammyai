import json
from emotional_thread_manager import analyze_message_emotion, detect_new_significant_emotion

def test_part3():
    print("\n=== PART 3: Thread Creation Sanity Check ===")
    cases = [
        ("hey tammy", "neutral", 0, False),
        ("value x effort x time", "neutral", 0, False),
        ("busy week", "annoyance", 5, False),
        ("I want to die", "sadness", 8, True),
        ("just frustrated", "annoyance", 9, False), # annoyance does not warrant a persistent thread
        ("dumb situation", "annoyance", 6, False),
        ("just so angry about all of this", "anger", 9, True)
    ]
    
    all_passed = True
    for msg, emotion, intensity, expected in cases:
        res = detect_new_significant_emotion(msg, emotion, intensity)
        passed = (res == expected)
        print(f"Input: ('{msg}', '{emotion}', {intensity}) -> {res} (Expected: {expected}) -> {'PASS' if passed else 'FAIL'}")
        if not passed:
            all_passed = False
            
    print(f"Overall: {'PASS' if all_passed else 'FAIL'}")

if __name__ == '__main__':
    test_part3()
