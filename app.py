from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from aux import get_messages, add_message, delete_overflow_messages, is_messages_full
from keys import SECRET_KEY

# for socketio
import eventlet
eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
socketio = SocketIO(app, async_mode='eventlet')


@app.route('/')
def sessions():
    return render_template('index.html')


@socketio.on('succesful_connection')
def load_initial_msgs():
    msgs = get_messages()[::-1]
    if not msgs:
        emit('no_msgs')
    else:
        # emit('load_msgs', {'msgs': msgs, 'len': len(msgs)})
        data = {
            'msgs': msgs[:5],
            'current_page': 1,
            'len': len(msgs)
            }
        emit('buffer_ready', data)


# al enviar un msg todos vuelven a la primera página
@socketio.on('send_message')
def save_message(data):
    msg = data['msg']
    add_message(msg)
    if is_messages_full():
        delete_overflow_messages()
    msgs = get_messages()[::-1]
    # emit('load_msgs', {'msgs': msgs, 'len': len(msgs)}, broadcast=True)
    data = {
        'msgs': msgs[:5],
        'current_page': 1,
        'len': len(msgs)
        }
    emit('buffer_ready', data, broadcast=True)


@socketio.on('msgs_buffer')
def five_msgs(data):
    np = data['next']  # next page
    msgs = get_messages()[::-1]
    msg_buffer = msgs[(np - 1) * 5: np * 5]
    data = {
        'msgs': msg_buffer,
        'current_page': np,
        'len': len(msgs)
        }
    emit('buffer_ready', data)


if __name__ == '__main__':
    socketio.run(app, debug=True)
    # production
    # socketio.run(app)
