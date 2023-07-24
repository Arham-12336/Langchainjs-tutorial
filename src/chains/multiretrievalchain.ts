import {LLMChain, MultiRetrievalQAChain,ConversationalRetrievalQAChain,RetrievalQAChain,loadQAChain} from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from './pinecone-client.js';
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import {OpenAIChat} from "langchain/llms/openai";
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';

const CONDENSE_PROMPT_V4 = PromptTemplate.fromTemplate(`
Given the question, rephrase the question as a standalone query without altering its meaning. Please note that the following properties when rephrasing the question:
If the question is a greeting, affirmation, polite response, acceptance, or agreement, it should not be modified.
If the question is about specific/particular articles double check the article no from the table of content and rephrase the question accordingly.
Follow-up Question: {question}
Rephrased Question (preserving semantics):
`);

const QA_PROMPT_ARTICLE_AND_GLOSSARY_V8 = PromptTemplate.fromTemplate(
  `You are a lawyer providing advice on Investment Funds Regulations and Capital Market Institution Regulations of the Kingdom of Saudi Arabia. Please answer the question based on the regulatory document provided. The document consists of articles and a glossary. To ensure accuracy, please reference the appropriate article or glossary definition in your answer. When referencing an article or glossary definition, please provide the corresponding number or letter for clarity.
If the question is a greeting,affirmative, polite, acceptance,agreement response,or asking about your capabilites abilities as An AI model, please respond in the manner you are desinged to deal with them without providing additional information.
If a question cannot be answered by the information provided in the document, please respond with "No" followed by a brief explanation or reason. 
If the question is about a particular article, kindly respond accordingly about that article. 
For questions that can be answered, please provide a reference to the appropriate article or glossary definition, along with a short explanation if necessary.Please donot provide extra information.
If you still can't find the answer, simply say "Apologies.Can you please provide more context?" Please avoid making up an answer.
Please adopt a friendly tone throughout your responses, and offer further assistance after answering. Format your answer using bullet points denoted by a dash symbol.
{context}:
Question: {question}
Answer in Markdown:`);
  const index = pinecone.Index('ifrs-v1');
  const cmir=await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        namespace:'CMIR',
        textKey:'text'
      }
    );
  
    const ifrs=await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        namespace:'IFRs-regulations',
        textKey:'text'
      }
    );
    const glossary=await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        namespace:'Glossary',
        textKey:'text'
      }
    );

      // const llm = new OpenAIChat({
      //   temperature: 0,
      //   modelName: 'gpt-3.5-turbo', 
      //   maxTokens:400,
      //   streaming: Boolean(onTokenStream),
      //   callbackManager: onTokenStream
      //     ? CallbackManager.fromHandlers({ 
      //         async handleLLMNewToken(token) {
      //           onTokenStream(token);
      //         },
      //       })
      //     : undefined,
      // });
    
      const retrieverNames=["cmir","ifrs","glossary"];
      const retrieverDescriptions=[
        "This namespace deals with questions related to the Capital Market Investment Regulations (CMIR)",
        "This namespace deals with questions related to the Investment Fund Regulations (IFR)",
        "This namespace provides deinitions for the terminology used in the articles"
      ];

      const retrievers = [
        cmir.asRetriever(3),
        ifrs.asRetriever(3),
        glossary.asRetriever(3),
      ];

      const questionGenerator = new LLMChain({
        llm: new OpenAIChat({ temperature: 0 }),   
        prompt: CONDENSE_PROMPT_V4,
        });
          export const mrchain=(
            vectorstore: PineconeStore,
            onTokenStream?: (token: string) => void,
          )=>{
            const retriever=vectorstore.asRetriever();
            const llm = new OpenAIChat({
              temperature: 0,
              modelName: 'gpt-3.5-turbo', 
              maxTokens:400,
              streaming: Boolean(onTokenStream),
              callbackManager: onTokenStream
                ? CallbackManager.fromHandlers({ 
                    async handleLLMNewToken(token) {
                      onTokenStream(token);
                    },
                  })
                : undefined,
            });     
            const multiRetrievalQAChain = MultiRetrievalQAChain.fromLLMAndRetrievers(
           llm,
          {
          retrieverNames,
          retrieverDescriptions,
          retrievers,
          retrievalQAChainOpts: {
            returnSourceDocuments: true,
            prompt:QA_PROMPT_ARTICLE_AND_GLOSSARY_V8,
          },
        }   
     
      );
  return multiRetrievalQAChain;
          }

     