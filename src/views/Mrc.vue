<template>

  <v-card max-width="1800" class="mx-auto grey lighten-5" flat>

    <v-container class="grey lighten-5">
      <v-row>
        <v-col sm="12">
          <v-card class="grey lighten-5" flat >
            <v-card-title> 
              <v-icon large left color="blue darken-2">mdi-file-document-box</v-icon>
              <span class="headline font-weight-bold dark">Question Answering 서비스</span>      
            </v-card-title>
          </v-card>

          <v-row no-gutters>
            <v-col cols="12" sm="12">

              <v-card flat class="grey lighten-5" tile>
                 <v-select v-model="sentence" :items="sentences" solo
                 label="문장을 선택하거나 아래 박스에 문장을 입력하세요."  @change="change_title">
                </v-select> 
              </v-card>
            </v-col>           

            <v-col cols="12" sm="12">
<!--               <v-card-title> 
                <span class="headline font-weight-bold dark">문장 입력</span>    
              </v-card-title> -->
              <v-textarea outlined name="input-1" auto-grow rows="5" clearable label="" v-model="passage">
              </v-textarea>
            </v-col> 
          </v-row>
        </v-col>
      </v-row>
    </v-container>


    <v-container class="grey lighten-5">
      <v-row>
        <v-col sm="12">
          <v-row no-gutters>
            <v-col cols="12" sm="12">
              <v-card flat class="grey lighten-5" tile>
               <v-select 
                v-model='select'
                :items="qas" 
                item-text="question"
                item-value="answer"
                return-object
                label="질문을 선택하거나 아래 박스에 질문을 입력하세요." solo @change="change_question">
                </v-select> 
              </v-card>
            </v-col>
          </v-row>
<!--           <v-card-title> 
            <span class="headline font-weight-bold dark">질문 입력</span>    
          </v-card-title> -->
          <v-textarea outlined name="input-1" label="" v-model="question" @input="change_question_input"
          rows="2" clearable >          
          </v-textarea>

          <p class="display-1 font-weight-bold justify-center" >
            [질  문] {{question}}
          </p>
         <p v-if="view_answer" class="grey--text display-1 font-weight-bold justify-center" >
            [정  답] {{select.answer}}
          </p>
          <p class="blue--text display-1 font-weight-bold justify-center" >
            [AI답변] {{answer}}
          </p>

          <v-card-title primary-title class="title font-weight-light justify-center">
            <v-btn large color="primary" @click="mrc" :loading="process_dialog" :disabled="process_dialog">질문하기</v-btn>
          </v-card-title>

        </v-col>
      </v-row>
    </v-container>

    <v-container class="grey lighten-5">
      <v-row>
        <v-col sm="12">
          <v-card-title>
          </v-card-title>
        </v-col>
      </v-row>
    </v-container>    

    <div class="text-center">
      <v-dialog v-model="process_dialog" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Processing...
            <v-progress-linear indeterminate color="white" class="mb-0">
            </v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-center">
      <v-dialog v-model="mrc_answer_dialog" width="800">
        <v-card>
          <v-card-title class="headline blue lighten-2" primary-title>
            기계독해 결과
          </v-card-title>
          <v-card-text>
          </v-card-text>
          <v-card-text>
            <p class="title text--primary">
            <v-icon large color="blue darken-2">mdi-comment-question</v-icon>
            질문 : {{ question }}
            </p>          
            <p class="title text--primary">
            <v-icon large color="blue darken-2">mdi-message-text</v-icon>
            답변 : {{ answer }}
            </p>
            <p class="title text--primary">
            <v-icon large color="blue darken-2">mdi-camera-switch</v-icon>
            답변위치 : {{ start_index }} - {{ end_index }}
            </p>
            <p class="title text--primary">
            <v-icon large color="blue darken-2">mdi-shield-check</v-icon>
            정답확률 : {{ probability }}
            </p>                       
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-layout align-center justify-center>
              <v-btn dark color="primary" 
              @click="mrc_answer_dialog = false">
                확 인
              </v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

  </v-card >
</template>
    

<script>
import axios from 'axios'
export default {
  data: () => ({
    disabled: false,
    process_dialog: false,
    mrc_answer_dialog: false,
    sentence_no: 0,  
    sentence: "",
    sentences: [],
    passage: "",
    passage2: "",
    passages: [],
    question: "",

    select: {
      question : "질문을 선택 또는 입력하세요.",
      answer : ""
    },

    view_answer: true,
    qas: [],

    start_index: 0,
    end_index: 0,
    probability: "",
    answer: "",
    pos_data : "",
    duration : 120000,
    badge_class: 'badge',
    text_class: 'ml-2'
  }),
  created: function () {
    this.get_tilte(); 
  },  
  watch: {
    process_dialog(val) {
      if (!val) return
      setTimeout(() => (this.process_dialog = false), 5000)
    },
    mrc_answer_dialog(val) {
      if (!val) return
      setTimeout(() => (this.mrc_answer_dialog = false), 5000)
    }
  },
  methods: {
    get_tilte() {
      let url = "http://localhost:8000/mrc/get-sentence/"
      axios.get(url).then((response) => {
        this.sentences = response.data.sentences
      }).catch(function (error) {
        console.log(error);
      }); 
    },
    change_title(data) {
      let self = this
      self.overlay = false;    
      self.passage2 = ""
      self.html_doc = ""
      self.question = ""
      self.answer = ""
      self.right_answer = ""
      let url = "http://localhost:8000/mrc/get-passage/"
      let post_data = { "title": data }
      axios.post(url, post_data).then(response => {
        self.passage = response["data"]["passage"]; 
        self.qas = response["data"]["qas"]; 
        this.pos(self.passage)
      }).catch(function (error) {
        console.log(error);
      }); 
    },
    change_question(qa) {
      let self = this
      self.question = qa.question
      self.right_answer = qa.answer
      self.view_answer = true
      self.answer = ""
    },
    change_question_input() {
      let self = this
      self.view_answer = false
      self.answer = ""
    },
    mrc() {
      let self = this
      if(self.process_dialog){
        self.$swal({
          type: 'info',
          title: 'MRC 진행중입니다.',
        });
        return
      }

      if(self.passage == ""){
        self.$swal({
          type: 'info',
          title: '지문을 선택하세요.',
        });
        return
      }

      if(self.question == ""){
        self.$swal({
          type: 'info',
          title: '질문을 선택하세요.',
        });
        return
      }
      self.overlay = false
      self.process_dialog = true
      let url = "http://localhost:8000/mrc/"
      let post_data = {"question": self.question, "passage": self.passage}
      axios.post(url, post_data).then(response => {
        self.answer = response["data"]["answer"]
        self.start_index = response["data"]["start_index"]
        self.end_index = response["data"]["end_index"]
        self.probability = response["data"]["probability"]
        
        self.mrc_answer_dialog = true
        self.passage2 = "<strong><font color='white'>" + self.passage.slice(0, self.start_index) + "</font><font size='5' color='yellow'>" + self.passage.slice(self.start_index, self.end_index) + "</font><font color='white'>" + self.passage.slice(self.end_index) + "</font></strong>"
        self.overlay = true;
        self.process_dialog = false
      }).catch(function (error) {
        console.log(error);
      }); 
    }
  }
}
</script>
