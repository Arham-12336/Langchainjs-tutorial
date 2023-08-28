import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "pinecone-client";
import { mrchain } from "chains/multiretrievalchain.js";
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from "chains/pinecone-client.js";
import { multipromtchain } from "chains/multiprompt.js";
const index = pinecone.Index('ifrs-v1');
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({}),
   {
     pineconeIndex: index,
     textKey: 'text'
   }
);



const chain=multipromtchain(vectorStore,(token:string)=>{
  console.log("chain runs");
});

const response=chain.call({
  input:"Hello"
}
  
);
console.log("response:",response)
