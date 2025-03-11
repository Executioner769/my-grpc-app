// GENERATED CODE -- DO NOT EDIT!

"use strict";
var grpc = require("@grpc/grpc-js");
var protos_blog_pb = require("../protos/blog_pb.js");

function serialize_blog_CreateBlogRequest(arg) {
    if (!(arg instanceof protos_blog_pb.CreateBlogRequest)) {
        throw new Error("Expected argument of type blog.CreateBlogRequest");
    }
    return Buffer.from(arg.serializeBinary());
}

function deserialize_blog_CreateBlogRequest(buffer_arg) {
    return protos_blog_pb.CreateBlogRequest.deserializeBinary(
        new Uint8Array(buffer_arg)
    );
}

function serialize_blog_CreateBlogResponse(arg) {
    if (!(arg instanceof protos_blog_pb.CreateBlogResponse)) {
        throw new Error("Expected argument of type blog.CreateBlogResponse");
    }
    return Buffer.from(arg.serializeBinary());
}

function deserialize_blog_CreateBlogResponse(buffer_arg) {
    return protos_blog_pb.CreateBlogResponse.deserializeBinary(
        new Uint8Array(buffer_arg)
    );
}

function serialize_blog_ListBlogsRequest(arg) {
    if (!(arg instanceof protos_blog_pb.ListBlogsRequest)) {
        throw new Error("Expected argument of type blog.ListBlogsRequest");
    }
    return Buffer.from(arg.serializeBinary());
}

function deserialize_blog_ListBlogsRequest(buffer_arg) {
    return protos_blog_pb.ListBlogsRequest.deserializeBinary(
        new Uint8Array(buffer_arg)
    );
}

function serialize_blog_ListBlogsResponse(arg) {
    if (!(arg instanceof protos_blog_pb.ListBlogsResponse)) {
        throw new Error("Expected argument of type blog.ListBlogsResponse");
    }
    return Buffer.from(arg.serializeBinary());
}

function deserialize_blog_ListBlogsResponse(buffer_arg) {
    return protos_blog_pb.ListBlogsResponse.deserializeBinary(
        new Uint8Array(buffer_arg)
    );
}

var BlogServiceService = (exports.BlogServiceService = {
    listBlogs: {
        path: "/blog.BlogService/ListBlogs",
        requestStream: false,
        responseStream: true,
        requestType: protos_blog_pb.ListBlogsRequest,
        responseType: protos_blog_pb.ListBlogsResponse,
        requestSerialize: serialize_blog_ListBlogsRequest,
        requestDeserialize: deserialize_blog_ListBlogsRequest,
        responseSerialize: serialize_blog_ListBlogsResponse,
        responseDeserialize: deserialize_blog_ListBlogsResponse,
    },
    createBlog: {
        path: "/blog.BlogService/CreateBlog",
        requestStream: false,
        responseStream: false,
        requestType: protos_blog_pb.CreateBlogRequest,
        responseType: protos_blog_pb.CreateBlogResponse,
        requestSerialize: serialize_blog_CreateBlogRequest,
        requestDeserialize: deserialize_blog_CreateBlogRequest,
        responseSerialize: serialize_blog_CreateBlogResponse,
        responseDeserialize: deserialize_blog_CreateBlogResponse,
    },
});

exports.BlogServiceClient = grpc.makeGenericClientConstructor(
    BlogServiceService,
    "BlogService"
);
