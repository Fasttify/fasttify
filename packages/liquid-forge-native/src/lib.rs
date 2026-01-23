/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//! # Liquid Forge Native
//!
//! High-performance Rust implementations of Liquid template filters.
//!
//! This library provides native Rust implementations of text manipulation
//! filters that are significantly faster than their JavaScript counterparts.

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

mod filters;

pub use filters::*;
