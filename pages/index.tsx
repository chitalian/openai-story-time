/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { v4 as uuidv4 } from "uuid";
import { promptsDB } from "./api/log";
import { CiTwitter } from "react-icons/ci";
import { BiCopy } from "react-icons/bi";
import { BiUndo } from "react-icons/bi";
import { useRouter } from "next/router";

function getStartingPrompt(input: string): string {
  return `
You are a story video game where you give me options (A, B, C, D) as my choices, and are written in the first person.
I can either respond with (A,B,C,D), or give my own option.
Make sure the story does not loop back to the same scene.
Keep the story fun, interesting and engaging for me.
Add a section before each choice describing the events as "Event". 
Make sure the options include characters and drive the plot forward, and give visual details.

Make sure every response you give me follows this template exactly

BEGIN - Here is the template

Event: {event}

Suggested options:
A: {option A}
B: {option B}
C: {option C}
D: {option D}

END - this is the end of the template

The scene is Disney's ${input}.

What is my first set of Event Image and options?
`;
}

export default function Home() {
  const router = useRouter();
  const { id } = router.query;
  const [scene, setScene] = useState("Disney's Moana");
  const [story, setStory] = useState("");
  function startSequence() {
    fetch("/api/gpt3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: getStartingPrompt(scene),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStory(data.message);
      });
  }

  function nextSequence(choice: string) {
    fetch("/api/gpt3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: story + "\n Here is my choice: " + choice + "\n\n now continue",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStory(data.message);
      });
  }

  return (
    <div className="dark:bg-black dark:text-slate-200">
      <Head>
        <title>Dream Submarine</title>
        <meta name="description" content="AI generated stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Make a text box that always stays on the bottom tailwind*/}
      <main className="px-32 flex flex-col w-full flex-1 text-center min-h-screen ">
        Enter a scene
        {story === "" ? (
          <>
            <textarea
              className="w-full h-12 p-2 border border-gray-300 rounded-lg dark:bg-black dark:text-slate-200"
              value={scene}
              disabled={true}
              onChange={(e) => setScene(e.target.value)}
            />
            <button
              className="w-1/2 p-2 mx-auto mt-4 text-white bg-blue-500 rounded-lg"
              onClick={() => {
                if (story == "") {
                  startSequence();
                } else {
                }
              }}
            >
              Generate
            </button>
          </>
        ) : (
          <>
            <img
              src="https://i.guim.co.uk/img/media/7a7018d981413bff1d96b5bef3d7c1f5ef0961ff/299_0_2800_1680/master/2800.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=fb73ef8f104c36cda1977c56452e4681"
              className="w-80 h-80 object-cover items-center self-center"
            ></img>
          </>
        )}
        <div className="whitespace-pre-wrap">
          {story !== "" &&
            story
              .split("What is my first set of Event Image and options?")[1]
              .split("now continue the story")
              .map((line) => (
                <div
                  className="border-2 m-5 justify-start text-left px-8"
                  key={uuidv4()}
                >
                  {line}
                </div>
              ))}
        </div>
        {story !== "" ? (
          <>
            {["A", "B", "C", "D"].map((choice) => (
              <button
                className="w-1/2 p-2 mx-auto mt-4 text-white bg-blue-500 rounded-lg"
                onClick={() => {
                  nextSequence(choice);
                }}
                key={choice}
              >
                {choice}
              </button>
            ))}
          </>
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}
