import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation, Storage } from "aws-amplify";

import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  StepperField,
 
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import { listMessages, messagesByChannelID } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  createMessage as createMessageMutation,
} from "./graphql/mutations";

import "@aws-amplify/pubsub";
import { onCreateMessage } from "./graphql/subscriptions";

import { Auth } from '@aws-amplify/auth';

const App = ({ signOut }) => {

  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [value, setValue] = React.useState(0);

  const handleOnStepChange = (newValue) => {
    alert(`New value: ${newValue}`);
    setValue(newValue);
  };
  //const [notes, setNotes] = useState('');
   
  useEffect(() => {
    Auth.currentUserInfo().then((userInfo) => {
      setUserInfo(userInfo)
    })
  }, [])
  
  useEffect(() => {
    // fetchNotes();
    fetchMessages();
  }, [value]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateMessage)
    ).subscribe({
      next: (event) => {
        setMessages([...messages, event.value.data.onCreateMessage]);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [messages]);

  async function fetchMessages() {
    const apiData = await API.graphql(
      graphqlOperation(messagesByChannelID, {
        channelID: value,
        sortDirection: "ASC",
      })
    );
    const msgFromAPI = apiData.data.messagesByChannelID.items;

    // await Promise.all(
    //   notesFromAPI.map(async (note) => {
    //     if (note.image) {
    //       const url = await Storage.get(note.name);
    //       note.image = url;
    //     }
    //     return note;
    //   })
    // );
    setMessages(msgFromAPI);
  }

  // async function fetchNotes() {
  //   const apiData = await API.graphql({ query: listNotes });
  //   const notesFromAPI = apiData.data.listNotes.items;
  //   await Promise.all(
  //     notesFromAPI.map(async (note) => {
  //       if (note.image) {
  //         const url = await Storage.get(note.name);
  //         note.image = url;
  //       }
  //       return note;
  //     })
  //   );
  //   setNotes(notesFromAPI);
  // }

  // async function createNote(event) {
  //   event.preventDefault();
  //   const form = new FormData(event.target);
  //   const image = form.get("image");
  //   const data = {
  //     name: form.get("name"),
  //     description: form.get("description"),
  //     image: image.name,
  //   };
  //   if (!!data.image) await Storage.put(data.name, image);
  //   await API.graphql({
  //     query: createNoteMutation,
  //     variables: { input: data },
  //   });
  //   fetchNotes();
  //   event.target.reset();
  // }

  // async function deleteNote({ id, name }) {
  //   const newNotes = notes.filter((note) => note.id !== id);
  //   setNotes(newNotes);
  //   await Storage.remove(name);
  //   await API.graphql({
  //     query: deleteNoteMutation,
  //     variables: { input: { id } },
  //   });
  // }


  const handleChange = (event) => {
    setMessageBody(event.target.value);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const input = {
      channelID: value,
      author: userInfo.id,
      body: messageBody.trim()
    };

    try {
      setMessageBody('');
      await API.graphql(graphqlOperation(createMessageMutation, { input }))
    } catch (error) {
      console.warn(error);
    }
  };


  return (
    <div className="app">
      {userInfo && (
        <div className="header">
          <div className="profile">
            You are logged in as: <strong>{userInfo.username}</strong>
          </div>
          <StepperField
  max={10}
  min={0}
  step={1}
  defaultValue={1}
  label="Channel ID"
  value={value}
      onStepChange={handleOnStepChange}
/>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      )}
      <div className="container">
        <div className="messages">
          <div className="messages-scroller">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.author === userInfo?.id ? 'message me' : 'message'}>{message.body}</div>
            ))}
          </div>
        </div>
        <div className="chat-bar">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="message"
              placeholder="Type your message here..."
              disabled={userInfo === null}
              onChange={handleChange}
              value={messageBody} />
          </form>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="container">
  //     <Button onClick={signOut}>Sign Out</Button>
  //     <div className="messages">
  //       <div className="messages-scroller">
  //         {messages.map((message) => (
  //           <div
  //             key={message.id}
  //             className={message.author === "Dave" ? "message me" : "message"}
  //           >
  //             {message.body}
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //     <div className="chat-bar">
  //       <form onSubmit={handleSubmit}>
  //         <input
  //           type="text"
  //           name="message"
  //           placeholder="Type your message here"
  //           onChange={handleChange}
  //           value={messageBody}
  //         />
  //       </form>
  //     </div>
  //   </div>






    // <View className="App">
    //   <Heading level={1}>My Notes App</Heading>
    //   <View as="form" margin="3rem 0" onSubmit={createNote}>
    //     <Flex direction="row" justifyContent="center">
    //       <TextField
    //         name="name"
    //         placeholder="Note Name"
    //         label="Note Name"
    //         labelHidden
    //         variation="quiet"
    //         required
    //       />
    //       <TextField
    //         name="description"
    //         placeholder="Note Description"
    //         label="Note Description"
    //         labelHidden
    //         variation="quiet"
    //         required
    //       />
    //       <View
    //         name="image"
    //         as="input"
    //         type="file"
    //         style={{ alignSelf: "end" }}
    //       />
    //       <Button type="submit" variation="primary">
    //         Create Note
    //       </Button>
    //     </Flex>
    //   </View>
    //   <Heading level={2}>Current Notes</Heading>
    //   <View margin="3rem 0">
    //     {notes.map((note) => (
    //       <Flex
    //         key={note.id || note.name}
    //         direction="row"
    //         justifyContent="center"
    //         alignItems="center"
    //       >
    //         <Text as="strong" fontWeight={700}>
    //           {note.name}
    //         </Text>
    //         <Text as="span">{note.description}</Text>
    //         {note.image && (
    //           <Image
    //             src={note.image}
    //             alt={`visual aid for ${notes.name}`}
    //             style={{ width: 400 }}
    //           />
    //         )}
    //         <Button variation="link" onClick={() => deleteNote(note)}>
    //           Delete note
    //         </Button>
    //       </Flex>
    //     ))}
    //   </View>

    //   <Button onClick={signOut}>Sign Out</Button>
    // </View>
  // );
};

export default withAuthenticator(App);
