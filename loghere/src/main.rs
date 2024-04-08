#![allow(warnings)] 
use std::collections::HashMap;
use std::{fmt, thread};
use std::fs::File;
use std::future::Pending;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use chrono::Local;
// use alloc::task;
use serde_json::Value;
// use regex::Regex;
// use tera::{Tera, Context};
use tiny_http::{Server, Response, Header, Request, Method, StatusCode};

fn handle_client(mut request:Request)->Result<(),()> {
    
    match(request.method(),request.url()){
        // (Method::Post,"/")=>{
        _=>{
            
            let mut buf=Vec::new();
            request.as_reader().read_to_end(&mut buf);
            let body= std::str::from_utf8(&buf).map_err(|err|{
                eprintln!("error: couldn't interpret body as UTF-8:{err}")
            })?;
            
            // println!("addnote body: {:?}",body);
            let v:Value=serde_json::from_str(&body).unwrap();
            let url = v["url"].as_str().unwrap();
            let title = v["title"].as_str().unwrap_or("");
            let date = Local::now();
            let current_date = date.format("%Y-%m-%d").to_string();
            let tosave=format!("{current_date}\t\t{url}\t\t{title}\n");
            println!("{tosave}");
            write!(File::options().create(true).append(true).open(format!("./{current_date}.txt")).expect("Cannot create file."), "{}",tosave );
            let h="Ok";
            // drop(request);
            // redirect(request,"/")?;
            request.respond(
                Response::from_string(
                    serde_json::to_string(&h).unwrap()
                ).
                with_status_code(StatusCode(200))).
                map_err(
                    |err|{
                        eprintln!("could not serve request error {}",err);
                    }
                )?;
            
        }
    }
    
    Ok(())
}


// Call the function with a sample markdown file path

fn main() ->Result<(),()>{
    let address="127.0.0.1".to_string();
    let port="6956".to_string();
    let serveurl=format!("{}:{}",address,port);
    let server=Server::http(&serveurl).map_err(|err|{
        eprintln!("{err}")
    })?;
    println!("listening @ {}",serveurl);
    for request in server.incoming_requests(){
        handle_client(request);
    }
    Ok(())
}