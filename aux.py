import json


def get_messages():
    with open('messages.json') as json_file:
        messages = json.load(json_file)
        return messages


def add_message(msg):
    messages = get_messages()
    messages.append(msg)
    with open('messages.json', 'w') as json_file:
        json.dump(messages, json_file)


def delete_overflow_messages():
    messages = get_messages()
    print('overflow')
    print()
    while len(messages) > 100:
        messages.pop(0)
    with open('messages.json', 'w') as json_file:
        json.dump(messages, json_file)


def is_messages_full():
    messages = get_messages()
    if len(messages) > 100:
        return True
    return False
